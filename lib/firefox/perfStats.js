import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.firefox');

export class PerfStats {
  constructor(runner, firefoxConfig) {
    this.runner = runner;
    this.firefoxConfig = firefoxConfig;
  }

  async start() {
    const runner = this.runner;
    const featureMask = this.firefoxConfig.perfStatsParams.mask;
    const script = `ChromeUtils.setPerfStatsCollectionMask(${featureMask});`;
    return runner.runPrivilegedScript(script, 'Start PerfStats Measurement');
  }

  async stop() {
    const runner = this.runner;
    const script = `ChromeUtils.setPerfStatsCollectionMask(0);`;
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
