import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.firefox');

export class PerfStats {
  constructor(runner) {
    this.runner = runner;
  }

  async start(features) {
    const runner = this.runner;

    // Parse features if it's a string
    let featuresArray = features;
    if (typeof features === 'string') {
      featuresArray = features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
    }

    // eslint-disable-next-line prettier/prettier
    const allFeaturesMask = 0xFF_FF_FF_FF;

    const script = `
      if (typeof ChromeUtils.setPerfStatsFeatures === 'function') {
        if (!${JSON.stringify(featuresArray)} || ${JSON.stringify(featuresArray)}.length === 0) {
          ChromeUtils.enableAllPerfStatsFeatures();
        } else {
          ChromeUtils.setPerfStatsFeatures(${JSON.stringify(featuresArray)});
        }
      } else if (typeof ChromeUtils.setPerfStatsCollectionMask === 'function') {
        ChromeUtils.setPerfStatsCollectionMask(${features || allFeaturesMask});
      } else {
        throw new Error('PerfStats API not available in this Firefox version');
      }
    `;

    return runner.runPrivilegedScript(script, 'Start PerfStats Measurement');
  }

  async stop() {
    const runner = this.runner;

    const script = `
      if (typeof ChromeUtils.setPerfStatsFeatures === 'function') {
        ChromeUtils.setPerfStatsFeatures([]);
      } else if (typeof ChromeUtils.setPerfStatsCollectionMask === 'function') {
        ChromeUtils.setPerfStatsCollectionMask(0);
      } else {
        throw new Error('PerfStats API not available in this Firefox version');
      }
    `;

    return runner.runPrivilegedScript(script, 'Stop PerfStats Measurement');
  }

  async collect() {
    const runner = this.runner;

    const script = `
    const callback = arguments[arguments.length - 1];
    async function collectPerfStats() {
      try {
        const result = await ChromeUtils.collectPerfStats();
        return callback(result);
      }
      catch(e) {
        return callback({'error': e});
      }
    };
    return collectPerfStats();
    `;

    try {
      const perfStatsResult = await runner.runPrivilegedAsyncScript(
        script,
        'Collect PerfStats'
      );

      // Combine the perf stats from the eacj processes
      const combinedPerfStats = {};
      const perfStats = JSON.parse(perfStatsResult);
      for (const process of perfStats.processes) {
        for (const metric of process.perfstats.metrics) {
          const metricName = metric.metric;
          if (!(metricName in combinedPerfStats)) {
            combinedPerfStats[metricName] = 0;
          }
          combinedPerfStats[metricName] += Math.round(metric.time);
        }
      }
      return combinedPerfStats;
    } catch (error) {
      log.error('Could not collect perf stats', error);
    }
  }
}
