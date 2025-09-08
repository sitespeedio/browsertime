import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.perfetto');
import path from 'node:path';
const { join } = path;
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { isAndroidConfigured, Android } from '../../../android/index.js';
const delay = ms => new Promise(res => setTimeout(res, ms));
/**
 * Manages the collection of perfetto traces on Android.
 *
 * @class
 * @hideconstructor
 */

// Default config that works for both chrome and firefox.  It contains
// basic system information, but no track events.  Those must be specified
// manually through perfetto.start(config).
const defaultConfig = `write_into_file: true

buffers: {
    size_kb: 522240
    fill_policy: DISCARD
}
buffers: {
    size_kb: 2048
    fill_policy: DISCARD
}
data_sources: {
    config {
        name: "android.packages_list"
        target_buffer: 1
    }
}
data_sources: {
    config {
        name: "linux.process_stats"
        target_buffer: 1
        process_stats_config {
            scan_all_processes_on_start: true
        }
    }
}
data_sources: {
    config {
        name: "linux.ftrace"
        ftrace_config {
            ftrace_events: "power/suspend_resume"
            ftrace_events: "power/cpu_frequency"
            ftrace_events: "power/cpu_idle"
            ftrace_events: "regulator/regulator_set_voltage"
            ftrace_events: "regulator/regulator_set_voltage_complete"
            ftrace_events: "power/clock_enable"
            ftrace_events: "power/clock_disable"
            ftrace_events: "power/clock_set_rate"
        }
    }
}
duration_ms: 60000`;
export class PerfettoTrace {
  constructor(browser, index, storageManager, options) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.storageManager = storageManager;
    /**
     * @private
     */
    this.options = options;
    /**
     * @private
     */
    this.index = index;
  }

  async uploadConfigFile(android, config) {
    let destinationFilename = join(this.dataDir, `perfetto-config.txt`);

    try {
      await writeFile(destinationFilename, config);
    } catch (error) {
      console.error(error);
    }

    return android._uploadFile(
      destinationFilename,
      '/sdcard/browsertime-perfetto-config.txt'
    );
  }

  async downloadTrace() {
    let destinationFilename = join(this.dataDir, `trace.perfetto`);
    let deviceTraceFilename = '/data/misc/perfetto-traces/trace';
    log.info(
      `Downloading perfetto trace from ${deviceTraceFilename} to ${destinationFilename}`
    );
    return this.android._downloadFile(deviceTraceFilename, destinationFilename);
  }

  /**
   * Begin Perfetto Trace Collection.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when tracing is finished.
   * @throws {Error} Throws an error if the configuration is not set for perfetto tracing.
   */
  async start(config = defaultConfig) {
    if (!isAndroidConfigured(this.options)) {
      throw new Error('Perfetto tracing is only available on Android.');
    }

    this.android = new Android(this.options);

    // Create empty subdir for simpleperf data.
    let dirname = `perfetto-${this.index}`;
    let counter = 1;

    while (true) {
      log.info(`Checking if ${dirname} exists...`);
      if (existsSync(join(this.storageManager.directory, dirname))) {
        dirname = `perfetto-${this.index}.${counter}`;
        counter++;
        log.info(`Directory already exists.`);
      } else {
        this.dataDir = await this.storageManager.createSubDataDir(dirname);
        log.info(`Creating subdir ${this.dataDir}.`);
        break;
      }
    }
    log.info('Finished creating directory.');

    // Check if perfetto is enabled on this device.
    const tracedEnabled = await this.android._runCommandAndGet(
      `getprop persist.traced.enable`
    );
    if (tracedEnabled !== '1') {
      log.info(`Disabling Perfetto: persist.traced.enable=${tracedEnabled}`);
      return;
    }

    // Create the trace config on the device.
    log.info('Creating perfetto config on device.');
    await this.uploadConfigFile(this.android, config);
    await delay(5000);

    // Start perfetto trace and detach.
    log.info('Starting perfetto tracing.');
    const output = await this.android._runCommandAndGet(
      'cat /sdcard/browsertime-perfetto-config.txt | perfetto -c - --txt --detach=browsertime -o /data/misc/perfetto-traces/trace'
    );
    log.info(`Perfetto starting output: ${output}`);

    // Remove the config file.
    await this.android.removeFileOnSdCard('browsertime-perfetto-config.txt');

    return new Promise((resolve, reject) => {
      if (output.includes('Connected to the Perfetto traced service')) {
        this.running = true;
        return resolve();
      } else {
        return reject();
      }
    });
  }

  /**
   * Stop Perfetto Trace Collection.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when tracing is finished and the perfetto
   *                          trace has been collected.
   * @throws {Error} Throws an error if the the perfetto session or trace was not found.
   */
  async stop() {
    if (!isAndroidConfigured(this.options)) {
      throw new Error('Perfetto tracing is only available on Android.');
    }

    if (!this.running) {
      throw new Error('Perfetto tracing was not started.');
    }

    // Attach and stop perfetto trace.
    log.info('Starting perfetto tracing.');
    const output = await this.android._runCommandAndGet(
      'perfetto --attach=browsertime --stop'
    );
    log.info(`Perfetto ending output: ${output}`);

    let stopSuccessful = false;

    if (output.includes('Trace written into the output file')) {
      stopSuccessful = true;
    } else {
      const logcat = await this.android._runCommandAndGet(`logcat -d`);
      if (/Tracing session \d+ ended, total sessions:0/.test(logcat)) {
        log.info('Warning: Perfetto session ended prematurely.');
        stopSuccessful = true;
      }
    }
    this.running = false;

    if (!stopSuccessful) {
      throw new Error('Perfetto process failed or ended suddenly.');
    }

    log.info('Perfetto tracing finished.');
    // Download perfetto trace.
    return this.downloadTrace();
  }
}
