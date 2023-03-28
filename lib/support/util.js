import groupBy from 'lodash.groupby';
import intel from 'intel';
const log = intel.getLogger('browsertime');

export function formatMetric(name, metric, multiple, inMs, extras) {
  if (metric === undefined) return;
  function fmt(value) {
    if (inMs) {
      return value < 1000 ? value + 'ms' : (value / 1000).toFixed(2) + 's';
    } else return value;
  }

  let formatted = `${name}: ${fmt(multiple ? metric.median : metric)}`;
  if (extras) {
    formatted += ` (σ${fmt(metric.stddev.toFixed(2))} ${
      metric.stddev > 0 ? metric.rsd.toFixed(1) : '0'
    }%)`;
  }
  return formatted;
}
export function logResultLogLine(results) {
  let index = 0;
  for (let result of results) {
    let totalSize = 0;
    let requests = '';
    let firstPaint = '',
      domContent = '',
      pageLoad = '',
      speedIndex = '',
      perceptualSpeedIndex = '',
      contentfulSpeedIndex = '',
      startRender = '',
      visualComplete85 = '',
      backEndTime = '',
      lastVisualChange = '',
      memory = '',
      lcp = '',
      fcp = '',
      cls = '',
      tbt = '',
      cpuBenchmark = '',
      nRuns = result.browserScripts.length,
      m = nRuns > 1;
    if (results.har && results.har.log.pages[index]) {
      // get the id
      let pageId = results.har.log.pages[index].id;
      let entriesByPage = groupBy(results.har.log.entries, 'pageref');
      requests = entriesByPage[pageId]
        ? entriesByPage[pageId].length + ' requests'
        : '';
      if (entriesByPage[pageId]) {
        for (const request of entriesByPage[pageId]) {
          // transfer size
          totalSize += request.response.bodySize;
        }
      }
      totalSize =
        totalSize > 1024
          ? (totalSize / 1024).toFixed(2) + ' kb'
          : totalSize + ' bytes';
    }

    if (result.statistics.browser && result.statistics.browser.cpuBenchmark) {
      cpuBenchmark = formatMetric(
        'CPUBenchmark',
        result.statistics.browser.cpuBenchmark,
        true,
        true,
        m
      );
    }

    if (result.statistics.timings && result.statistics.timings.pageTimings) {
      let pt = result.statistics.timings.pageTimings,
        t = result.statistics.timings,
        vm = result.statistics.visualMetrics,
        pi = result.statistics.pageinfo,
        cpu = result.statistics.cpu;

      firstPaint = formatMetric('firstPaint', t.firstPaint, true, true, m);
      if (t.largestContentfulPaint) {
        lcp = formatMetric(
          'LCP',
          t.largestContentfulPaint.renderTime,
          true,
          true,
          m
        );
      }

      if (pi && pi.cumulativeLayoutShift) {
        cls = formatMetric('CLS', pi.cumulativeLayoutShift, true, false, m);
      }

      if (cpu && cpu.longTasks && cpu.longTasks.totalBlockingTime) {
        tbt = formatMetric(
          'TBT',
          cpu.longTasks.totalBlockingTime,
          true,
          true,
          m
        );
      }

      if (
        result.statistics.timings.paintTiming &&
        result.statistics.timings.paintTiming['first-contentful-paint']
      ) {
        fcp = formatMetric(
          'FCP',
          result.statistics.timings.paintTiming['first-contentful-paint'],
          true,
          true,
          m
        );
      }

      domContent = formatMetric(
        'DOMContentLoaded',
        pt.domContentLoadedTime,
        true,
        true,
        m
      );
      speedIndex = formatMetric(
        'speedIndex',
        vm ? vm.SpeedIndex : vm,
        true,
        true,
        m
      );
      perceptualSpeedIndex = formatMetric(
        'perceptualSpeedIndex',
        vm ? vm.PerceptualSpeedIndex : vm,
        true,
        true,
        m
      );
      contentfulSpeedIndex = formatMetric(
        'contentfulSpeedIndex',
        vm ? vm.ContentfulSpeedIndex : vm,
        true,
        true,
        m
      );
      startRender = formatMetric(
        'firstVisualChange',
        vm ? vm.FirstVisualChange : vm,
        true,
        true,
        m
      );
      lastVisualChange = formatMetric(
        'lastVisualChange',
        vm ? vm.LastVisualChange : vm,
        true,
        true,
        m
      );
      visualComplete85 = formatMetric(
        'visualComplete85',
        vm ? vm.VisualComplete85 : vm,
        true,
        true,
        m
      );
      pageLoad = formatMetric('Load', pt.pageLoadTime, true, true, m);
      backEndTime = formatMetric('TTFB', pt.backEndTime, true, true, m);
    }

    if (result.statistics.memory) {
      let mem = result.statistics.memory;
      for (let value in mem) {
        mem[value] = Math.round(mem[value] / 1024 / 1024);
      }

      memory = formatMetric('Memory', mem, true, false, m);
      memory = memory + 'mb';
    }

    let lines = [
        `${requests}`,
        `${totalSize > 0 ? totalSize : ''}`,
        backEndTime,
        firstPaint,
        startRender,
        fcp,
        domContent,
        lcp,
        cls,
        tbt,
        cpuBenchmark,
        pageLoad,
        memory,
        speedIndex,
        perceptualSpeedIndex,
        contentfulSpeedIndex,
        visualComplete85,
        lastVisualChange
      ],
      note = m ? ` (${nRuns} runs)` : '';

    lines = lines.filter(Boolean).join(', ');
    log.info(`${result.info.url} ${lines}${note}`);
    index++;
  }
}
export function toArray(arrayLike) {
  if (arrayLike === undefined || arrayLike === null) {
    return [];
  }
  if (Array.isArray(arrayLike)) {
    return arrayLike;
  }
  return [arrayLike];
}
export function jsonifyVisualProgress(visualProgress) {
  // Original data looks like
  //  "0=0, 1500=81, 1516=81, 1533=84, 1550=84, 1566=84, 1600=95, 1683=95, 1833=100"
  if (typeof visualProgress === 'string') {
    const visualProgressArray = [];
    for (const value of visualProgress.split(', ')) {
      const [timestamp, percent] = value.split('=');
      visualProgressArray.push({
        timestamp: Number.parseInt(timestamp, 10),
        percent: Number.parseInt(percent, 10)
      });
    }
    return visualProgressArray;
  }
  return visualProgress;
}
export function adjustVisualProgressTimestamps(
  visualProgress,
  profilerStartTime,
  recordingStartTime
) {
  // calculate offset between unix timestamps which represents the profiler start
  // time and the time of the first frame after the orange frame after recording start
  for (const value of visualProgress) {
    value.timestamp += recordingStartTime - profilerStartTime;
  }
  return visualProgress;
}
