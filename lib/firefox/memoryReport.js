import path from 'node:path';
import { getLogger } from '@sitespeed.io/log';
import { pathToFolder } from '../support/pathToFolder.js';
import { BrowserError } from '../support/errors.js';
import { isAndroidConfigured, Android } from '../android/index.js';
const delay = ms => new Promise(res => setTimeout(res, ms));
const log = getLogger('browsertime.firefox');

/**
 * Timeout a promise after ms. Use promise.race to compete
 * about the timeout and the promise.
 * @param {promise} promise - The promise to wait for
 * @param {int} ms - how long in ms to wait for the promise to fininsh
 * @param {string} errorMessage - the error message in the Error if we timeouts
 */
async function timeout(promise, ms, errorMessage) {
  let timer;

  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(reject, ms, new BrowserError(errorMessage));
      return timer;
    }),
    promise.then(value => {
      clearTimeout(timer);
      return value;
    })
  ]);
}

export class MemoryReport {
  constructor(runner, storageManager, firefoxConfig, options) {
    this.runner = runner;
    this.storageManager = storageManager;
    this.firefoxConfig = firefoxConfig;
    this.options = options;
  }

  /**
   * The memory report parser will measure the total resident memory of the
   * entire firefox browser.  It does this by summing up the "resident" memory
   * of the parent process together with the "resident-unique" memory for each
   * subprocess.
   */
  async parse(reportFilename, subDir) {
    const report = JSON.parse(
      await this.storageManager.readData(reportFilename, subDir)
    );

    let memory = 0;

    for (const entry of Object.values(report.reports)) {
      if (entry.process.startsWith('Main Process')) {
        if (entry.path === 'resident') {
          memory += entry.amount;
        }
      } else {
        if (entry.path === 'resident-unique') {
          memory += entry.amount;
        }
      }
    }

    return memory;
  }

  async collect(index, url) {
    const runner = this.runner;
    const firefoxConfig = this.firefoxConfig;
    const options = this.options;

    let subDir = pathToFolder(url, options);
    let profileDir = await this.storageManager.createSubDataDir(subDir);

    let reportFilename = `memory-report-${index}.json.gz`;
    let destinationFilename = path.join(profileDir, reportFilename);

    let deviceReportFilename = destinationFilename;
    if (isAndroidConfigured(options)) {
      deviceReportFilename = `/sdcard/Android/data/${firefoxConfig.android.package}/files/memoryReport-${index}.json`;
    }

    let minimizeFirst = 'false';
    if (firefoxConfig.memoryReportParams.minizeFirst) {
      minimizeFirst = 'true';
    }

    log.info(
      `Collecting memory report from ${deviceReportFilename} to ${destinationFilename}`
    );
    let script = `Cc['@mozilla.org/memory-info-dumper;1'].getService(Ci.nsIMemoryInfoDumper).dumpMemoryReportsToNamedFile(String.raw\`${deviceReportFilename}\`, null, null, false, ${minimizeFirst});`;
    await timeout(
      runner.runPrivilegedScript(script, 'Collecting memory report'),
      1_200_000,
      'Could not get memory report'
    );

    // Add a delay in case the memory report is still writing to disk.
    await delay(3000);

    if (isAndroidConfigured(options)) {
      const android = new Android(options);
      await android._downloadFile(deviceReportFilename, destinationFilename);
    }

    return this.parse(reportFilename, subDir);
  }
}
