'use strict';
const fs = require('fs');
const log = require('intel').getLogger('browsertime.firefox');
const path = require('path');
const pathToFolder = require('../support/pathToFolder');

class PerfStats {
  constructor(runner, storageManager, firefoxConfig, options) {
    this.runner = runner;
    this.storageManager = storageManager;
    this.firefoxConfig = firefoxConfig;
    this.options = options;
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

  async collect(index, url) {
    const runner = this.runner;
    const storageManager = this.storageManager;
    const options = this.options;

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

      if (perfStatsResult) {
        let profileDir = await storageManager.createSubDataDir(
          path.join(pathToFolder(url, options))
        );
        let destinationFilename = path.join(
          profileDir,
          `perfStats-${index}.json`
        );

        fs.writeFileSync(destinationFilename, perfStatsResult);
      }
    } catch (e) {
      log.error('Could not collect perf stats', e);
    }
  }
}

module.exports = PerfStats;
