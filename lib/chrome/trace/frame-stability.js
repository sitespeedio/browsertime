/**
 * Frame stability — how smoothly the compositor produced frames
 * during the traced window. Jank (dropped frames, long gaps between
 * visual updates) is invisible in load metrics; this surfaces it
 * from the trace browsertime already records.
 *
 * Event shapes sampled from Chrome 150.0.7871.115 with the default
 * browsertime trace categories. The frame pipeline shows up as
 * `PipelineReporter` async events (cat
 * `cc,benchmark,disabled-by-default-devtools.timeline.frame`), one
 * b/e pair per frame attempt, paired via `id2.local` within a
 * process. The `b` event carries `args.frame_reporter` with the
 * final outcome: `state` (STATE_PRESENTED_ALL /
 * STATE_PRESENTED_PARTIAL / STATE_DROPPED / STATE_NO_UPDATE_DESIRED),
 * `affects_smoothness`, and `frame_sequence`. The `e` timestamp is
 * when the frame reached the screen (presentation) for presented
 * frames. The same frame_sequence can have several reporters
 * (forked / main + impl), so outcomes are merged per sequence. The
 * legacy instant events (BeginFrame, DrawFrame, DroppedFrame) are
 * still emitted and were used to cross-check: DroppedFrame instants
 * match STATE_DROPPED reporters with affects_smoothness=true.
 *
 * Only STATE_DROPPED frames flagged `affects_smoothness` are counted
 * as dropped — Chrome also marks no-damage idle frames STATE_DROPPED
 * and counting those would alarm on every static page.
 *
 * Returns: { presented, partial, dropped, effectiveFps, longestGap }
 *   presented    — frames that reached the screen after
 *                  navigationStart
 *   partial      — subset of presented where the compositor
 *                  presented without the main-thread update
 *                  (STATE_PRESENTED_PARTIAL only)
 *   dropped      — frames Chrome flags as dropped AND affecting
 *                  smoothness (its own jank signal)
 *   effectiveFps — presented frames over the first→last
 *                  presentation span; omitted with <2 presentations
 *   longestGap   — { duration, startTime } in ms relative to
 *                  navigationStart, the longest time between two
 *                  consecutive presented frames. On mostly-static
 *                  pages this includes idle time (nothing to draw),
 *                  so read it as "longest time between visual
 *                  updates", not proof of jank; omitted with <2
 *                  presentations
 */

import { computeTraceOfTab } from './trace-of-tab.js';

const PRESENTED_STATES = new Set([
  'STATE_PRESENTED_ALL',
  'STATE_PRESENTED_PARTIAL'
]);

function round1(number_) {
  return Math.round(number_ * 10) / 10;
}

export function computeFrameStability(trace) {
  const { mainFrameIds, timestamps } = computeTraceOfTab(trace);
  const navStart = timestamps.navigationStart;

  const open = new Map();
  const bySequence = new Map();
  for (const event of trace.traceEvents) {
    if (event.name !== 'PipelineReporter' || event.pid !== mainFrameIds.pid)
      continue;
    const id = (event.id2 && event.id2.local) || event.id;
    if (event.ph === 'b') {
      open.set(id, event);
    } else if (event.ph === 'e') {
      const begin = open.get(id);
      if (!begin) continue;
      open.delete(id);
      if (event.ts < navStart) continue;
      const reporter = (begin.args && begin.args.frame_reporter) || {};
      if (reporter.frame_sequence === undefined) continue;
      let frame = bySequence.get(reporter.frame_sequence);
      if (!frame) {
        frame = { presentedAll: false, presentedPartial: false };
        bySequence.set(reporter.frame_sequence, frame);
      }
      if (PRESENTED_STATES.has(reporter.state)) {
        if (reporter.state === 'STATE_PRESENTED_ALL') frame.presentedAll = true;
        else frame.presentedPartial = true;
        frame.presentationTs = Math.min(
          frame.presentationTs ?? Number.POSITIVE_INFINITY,
          event.ts
        );
      } else if (
        reporter.state === 'STATE_DROPPED' &&
        reporter.affects_smoothness === true
      ) {
        frame.dropped = true;
      }
    }
  }

  let presented = 0;
  let partial = 0;
  let dropped = 0;
  const presentationTimes = [];
  for (const frame of bySequence.values()) {
    if (frame.presentedAll || frame.presentedPartial) {
      presented++;
      if (!frame.presentedAll) partial++;
      presentationTimes.push(frame.presentationTs);
    } else if (frame.dropped) {
      dropped++;
    }
  }
  presentationTimes.sort((a, b) => a - b);

  let effectiveFps;
  let longestGap;
  if (presentationTimes.length >= 2) {
    const spanSeconds = (presentationTimes.at(-1) - presentationTimes[0]) / 1e6;
    if (spanSeconds > 0) {
      effectiveFps = round1((presentationTimes.length - 1) / spanSeconds);
    }
    let worst = 0;
    let worstStart = presentationTimes[0];
    for (let index = 1; index < presentationTimes.length; index++) {
      const gap = presentationTimes[index] - presentationTimes[index - 1];
      if (gap > worst) {
        worst = gap;
        worstStart = presentationTimes[index - 1];
      }
    }
    longestGap = {
      duration: round1(worst / 1000),
      startTime: round1((worstStart - navStart) / 1000)
    };
  }

  return { presented, partial, dropped, effectiveFps, longestGap };
}
