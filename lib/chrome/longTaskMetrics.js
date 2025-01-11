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

  for (let longTask of result.browserScripts.pageinfo.longTask) {
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
      tasks: result.browserScripts.pageinfo.longTask.length,
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
