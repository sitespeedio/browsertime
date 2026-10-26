import { getProperty } from '../support/util.js';

export function longTaskMetrics(result, options) {
  let totalDurationFirstPaint = 0;
  let totalDurationFirstContentFulPaint = 0;
  let totalDurationLargestContentFulPaint = 0;
  let totalDurationAfterLoadEventEnd = 0;
  let totalDuration = 0;

  // https://web.dev/lighthouse-max-potential-fid/
  let maxPotentialFid = 0;
  // https://web.dev/tbt/ - total blocking time
  let totalBlockingTime = 0;

  const firstPaint = getProperty(
    result,
    'browserScripts.timings.paintTiming.first-paint'
  );
  const firstContentfulPaint = getProperty(
    result,
    'browserScripts.timings.paintTiming.first-contentful-paint'
  );

  const largestContentfulPaint = getProperty(
    result,
    'browserScripts.timings.largestContentfulPaint.renderTime'
  ); // result.browserScripts.timings.largestContentfulPaint.loadTime;

  const loadEventEnd = getProperty(
    result,
    'browserScripts.timings.loadEventEnd'
  );

  let longTasksBeforeFirstPaint = 0;
  let longTasksBeforeFirstContentfulPaint = 0;
  let longTasksBeforeLargestContentfulPaint = 0;
  let longTasksAfterLoadEventEnd = 0;
  let lastLongTask = 0;

  let longTasks = result.browserScripts.pageinfo.longTask;
  // A soft navigation keeps the document, so the buffer also has the long
  // tasks of earlier routes. The paint metrics are relative to the soft
  // navigation start, so make the long tasks relative to it too.
  const softNavigation = getProperty(
    result,
    'browserScripts.timings.softNavigations',
    []
  ).at(-1);
  if (softNavigation) {
    longTasks = longTasks
      .filter(longTask =>
        longTask.navigationId === undefined
          ? longTask.startTime >= softNavigation.startTime
          : longTask.navigationId === softNavigation.navigationId
      )
      .map(longTask => ({
        ...longTask,
        startTime: longTask.startTime - softNavigation.startTime
      }));
  }

  for (let longTask of longTasks) {
    totalDuration += longTask.duration;
    if (longTask.startTime > lastLongTask) {
      lastLongTask = longTask.startTime;
    }
    if (firstPaint && longTask.startTime < firstPaint) {
      longTasksBeforeFirstPaint++;
      totalDurationFirstPaint += longTask.duration;
    }
    if (firstContentfulPaint && longTask.startTime < firstContentfulPaint) {
      longTasksBeforeFirstContentfulPaint++;
      totalDurationFirstContentFulPaint += longTask.duration;
    }
    if (largestContentfulPaint && longTask.startTime < largestContentfulPaint) {
      longTasksBeforeLargestContentfulPaint++;
      totalDurationLargestContentFulPaint += longTask.duration;
    }
    if (
      firstContentfulPaint &&
      longTask.startTime > firstContentfulPaint &&
      longTask.duration > maxPotentialFid
    ) {
      maxPotentialFid = longTask.duration;
    }
    if (firstContentfulPaint && longTask.startTime > firstContentfulPaint) {
      totalBlockingTime +=
        longTask.duration - (options.minLongTaskLength || 50);
    }
    if (loadEventEnd && longTask.startTime > loadEventEnd) {
      longTasksAfterLoadEventEnd++;
      totalDurationAfterLoadEventEnd += longTask.duration;
    }
  }

  const cpu = {
    longTasks: {
      tasks: longTasks.length,
      totalDuration,
      totalBlockingTime: Number(totalBlockingTime.toFixed(0)),
      maxPotentialFid: Number(maxPotentialFid.toFixed(0)),
      lastLongTask: Number(lastLongTask.toFixed(0)),
      beforeFirstPaint: {
        tasks: longTasksBeforeFirstPaint,
        totalDuration: totalDurationFirstPaint
      },
      beforeFirstContentfulPaint: {
        tasks: longTasksBeforeFirstContentfulPaint,
        totalDuration: totalDurationFirstContentFulPaint
      },
      beforeLargestContentfulPaint: {
        tasks: longTasksBeforeLargestContentfulPaint,
        totalDuration: totalDurationLargestContentFulPaint
      },
      afterLoadEventEnd: {
        tasks: longTasksAfterLoadEventEnd,
        totalDuration: totalDurationAfterLoadEventEnd
      }
    }
  };
  return cpu;
}
