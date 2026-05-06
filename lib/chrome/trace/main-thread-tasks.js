/**
 * Trace events → hierarchical task list. Ported verbatim from
 * @sitespeed.io/tracium 0.3.3 (Lighthouse 2017 lineage). Each
 * resulting `TaskNode` carries:
 *   { event, startTime, endTime, duration, selfTime,
 *     attributableURLs, parent, children, group }
 *
 * Times are returned in ms, rebased to the first task's startTime.
 *
 * Reference (Lighthouse upstream this file came from):
 *   https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/lib/tracehouse/main-thread-tasks.js
 *
 * Trace event format:
 *   https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview
 */

import { taskGroups, groupForEvent } from './task-groups.js';
import { computeTraceOfTab } from './trace-of-tab.js';

function createNewTaskNode(event, parent) {
  const newTask = {
    event,
    startTime: event.ts,
    endTime: event.ph === 'X' ? event.ts + Number(event.dur || 0) : Number.NaN,
    parent,
    children: [],
    // Filled in later
    attributableURLs: [],
    group: taskGroups.other,
    duration: Number.NaN,
    selfTime: Number.NaN
  };
  if (parent) {
    parent.children.push(newTask);
  }
  return newTask;
}

function createTasksFromEvents(mainThreadEvents, priorTaskData, traceEndTs) {
  const tasks = [];
  let currentTask;

  for (const event of mainThreadEvents) {
    // TimerInstall is an instant event (ph === 'I') — process it
    // first so timer→task attribution works for subsequent TimerFire.
    if (event.name === 'TimerInstall' && currentTask) {
      const timerId = event.args.data.timerId;
      priorTaskData.timers.set(timerId, currentTask);
    }

    // Only X (Complete), B (Begin), E (End) carry the data we need.
    if (event.ph !== 'X' && event.ph !== 'B' && event.ph !== 'E') continue;

    // Walk up the stack until we're inside a task that hasn't ended.
    while (
      currentTask &&
      Number.isFinite(currentTask.endTime) &&
      currentTask.endTime <= event.ts
    ) {
      currentTask = currentTask.parent;
    }

    if (!currentTask) {
      // Can't start a task with an end event — real-world traces
      // sometimes have a stray E without a matching B. Skip rather
      // than throw so a partly-malformed trace still produces output.
      if (event.ph === 'E') continue;
      currentTask = createNewTaskNode(event);
      tasks.push(currentTask);
      continue;
    }

    if (event.ph === 'X' || event.ph === 'B') {
      // Nested event — child of currentTask.
      const newTask = createNewTaskNode(event, currentTask);
      tasks.push(newTask);
      currentTask = newTask;
    } else {
      // event.ph === 'E' — close the current task. If currentTask
      // wasn't a B (e.g. the previous event was an X), the trace is
      // malformed; tolerate by skipping rather than throwing.
      if (currentTask.event.ph !== 'B') continue;
      currentTask.endTime = event.ts;
      currentTask = currentTask.parent;
    }
  }

  // Any tasks still open at the end of the trace end at traceEndTs.
  while (currentTask && !Number.isFinite(currentTask.endTime)) {
    currentTask.endTime = traceEndTs;
    currentTask = currentTask.parent;
  }

  return tasks;
}

function computeRecursiveSelfTime(task, parent) {
  if (parent && task.endTime > parent.endTime) {
    // Real-world traces occasionally produce children that report an
    // endTime past the parent's. Tolerate by treating the duration
    // as zero rather than throwing — the rest of the analysis stays
    // useful.
    return 0;
  }
  const childTime = task.children
    .map(child => computeRecursiveSelfTime(child, task))
    .reduce((sum, child) => sum + child, 0);
  task.duration = task.endTime - task.startTime;
  task.selfTime = task.duration - childTime;
  return task.duration;
}

function computeRecursiveAttributableURLs(task, parentURLs, priorTaskData) {
  const argsData = task.event.args.data || {};
  const stackFrameURLs = (argsData.stackTrace || []).map(entry => entry.url);

  let taskURLs = [];
  switch (task.event.name) {
    case 'v8.compile':
    case 'EvaluateScript':
    case 'FunctionCall': {
      taskURLs = [argsData.url, ...stackFrameURLs];
      break;
    }
    case 'v8.compileModule': {
      taskURLs = [task.event.args.fileName, ...stackFrameURLs];
      break;
    }
    case 'TimerFire': {
      const timerId = task.event.args.data.timerId;
      const timerInstallerTaskNode = priorTaskData.timers.get(timerId);
      if (!timerInstallerTaskNode) break;
      taskURLs = [
        ...timerInstallerTaskNode.attributableURLs,
        ...stackFrameURLs
      ];
      break;
    }
    default: {
      taskURLs = stackFrameURLs;
      break;
    }
  }

  const attributableURLs = [...parentURLs];
  for (const url of taskURLs) {
    if (!url) continue; // empty URL
    if (attributableURLs.at(-1) === url) continue; // dedupe consecutive
    attributableURLs.push(url);
  }
  task.attributableURLs = attributableURLs;
  for (const child of task.children)
    computeRecursiveAttributableURLs(child, attributableURLs, priorTaskData);
}

function computeRecursiveTaskGroup(task, parentGroup) {
  const group = groupForEvent(task.event.name);
  task.group = group || parentGroup || taskGroups.other;
  for (const child of task.children)
    computeRecursiveTaskGroup(child, task.group);
}

export function getMainThreadTasks(traceEvents, traceEndTs) {
  const timers = new Map();
  const priorTaskData = { timers };
  const tasks = createTasksFromEvents(traceEvents, priorTaskData, traceEndTs);

  for (const task of tasks) {
    if (task.parent) continue;
    computeRecursiveSelfTime(task);
    computeRecursiveAttributableURLs(task, [], priorTaskData);
    computeRecursiveTaskGroup(task);
  }

  // Rebase all the times to be relative to start of trace in ms.
  const firstTs = (tasks[0] || { startTime: 0 }).startTime;
  for (const task of tasks) {
    task.startTime = (task.startTime - firstTs) / 1000;
    task.endTime = (task.endTime - firstTs) / 1000;
    task.duration /= 1000;
    task.selfTime /= 1000;
    if (!Number.isFinite(task.selfTime)) {
      // Real-world tolerance — see computeRecursiveSelfTime. If a
      // task slipped through with NaN selfTime, treat it as zero so
      // downstream summing doesn't poison every category.
      task.selfTime = 0;
    }
  }

  return tasks;
}

export function compute(trace) {
  const { mainThreadEvents, timestamps } = computeTraceOfTab(trace);
  return getMainThreadTasks(mainThreadEvents, timestamps.traceEnd);
}
