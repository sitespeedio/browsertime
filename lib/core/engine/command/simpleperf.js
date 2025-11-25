import { getLogger } from '@sitespeed.io/log';
import path from 'node:path';
const { join } = path;
import { execa } from 'execa';
import { existsSync, renameSync } from 'node:fs';
import { isAndroidConfigured } from '../../../android/index.js';
// const delay = ms => new Promise(res => setTimeout(res, ms));
/**
 * Manages the collection of perfetto traces on Android.
 *
 * @class
 * @hideconstructor
 */

const log = getLogger('browsertime.command.simpleperf');

const defaultRecordOptions =
  '--call-graph fp --duration 240 -f 1000 --trace-offcpu -e cpu-clock';

/**
 * Timeout a promise after ms. Use promise.race to compete
 * about the timeout and the promise.
 * @param {promise} promise - the promise to wait for
 * @param {int} ms - how long in ms to wait for the promise to fininsh
 * @param {string} errorMessage - the error message in the Error if we timeouts
 */

async function timeout(promise, ms, errorMessage) {
  let timer;

  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(reject, ms, new Error(errorMessage));
      return timer;
    }),
    promise.then(value => {
      clearTimeout(timer);
      return value;
    })
  ]);
}

export class SimplePerfProfiler {
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
    /**
     * @private
     */
    this.running = false;
  }

  /**
   * Start Simpleperf profiling.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when simpleperf has started profiling.
   * @throws {Error} Throws an error if app_profiler.py fails to execute.
   */

  async start(
    profilerOptions = [],
    recordOptions = defaultRecordOptions,
    dirName = 'simpleperf'
  ) {
    if (!isAndroidConfigured(this.options)) {
      throw new Error('Simpleperf profiling is only available on Android.');
    }

    log.info('Starting simpleperf profiler.');

    // Create empty subdirectory for simpleperf data.
    let dirname = `${dirName}-${this.index}`;
    let counter = 0;

    while (true) {
      log.info(`Checking if ${dirname} exists...`);

      if (existsSync(join(this.storageManager.directory, dirname))) {
        dirname = `${dirName}-${this.index}.${counter}`;
        counter++;
        log.info(`Directory already exists.`);
      } else {
        this.dataDir = await this.storageManager.createSubDataDir(dirname);
        log.info(`Creating subdir ${this.dataDir}.`);
        break;
      }
    }

    // Execute simpleperf.
    const packageName =
      this.options.browser === 'firefox'
        ? this.options.firefox?.android?.package
        : this.options.chrome?.android?.package;
    let simpleperfPath = this.options.androidSimpleperf;
    let cmd = join(simpleperfPath, 'app_profiler.py');
    let args = [
      ...profilerOptions,
      '-p',
      packageName,
      '-r',
      recordOptions,
      '--log',
      'debug',
      '-o',
      join(this.dataDir, 'perf.data')
    ];
    this.simpleperfProcess = execa(cmd, args);

    // Waiting for simpleperf to start.
    let simpleperfPromise = new Promise((resolve, reject) => {
      let stderrStream = this.simpleperfProcess.stderr;
      stderrStream.on('data', data => {
        let dataStr = data.toString();
        log.info(dataStr);
        if (/command 'record' starts running/.test(dataStr)) {
          this.running = true;
          stderrStream.removeAllListeners('data');
          return resolve();
        }
        if (/Failed to record profiling data./.test(dataStr)) {
          this.running = false;
          log.info(`Error starting simpleperf: ${dataStr}`);
          throw new Error('Simpleperf failed to start.');
        }
      });
      stderrStream.once('error', reject);
    });

    // Set a 30s timeout for starting simpleperf.
    return timeout(simpleperfPromise, 30_000, 'Simpleperf timed out.');
  }

  /**
   * Stop Simpleperf profiling.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when simpleperf has stopped profiling
   *                          and collected profile data.
   * @throws {Error} Throws an error if app_profiler.py fails to execute.
   */
  async stop() {
    if (!isAndroidConfigured(this.options)) {
      throw new Error('Simpleperf profiling is only available on Android.');
    }

    if (!this.running) {
      throw new Error('Simpleperf profiling was not started.');
    }

    log.info('Stop simpleperf profiler.');
    this.simpleperfProcess.kill('SIGINT');

    // Return when "profiling is finished." is found, or an error.
    return new Promise((resolve, reject) => {
      let stderrStream = this.simpleperfProcess.stderr;
      log.info('Reading stderr.');
      stderrStream.on('data', data => {
        const dataStr = data.toString();
        log.info(dataStr);
        if (/profiling is finished./.test(dataStr)) {
          stderrStream.removeAllListeners('data');
          // There is no way to specify the output of binary_cache, so manually move
          // it into the data directory.
          renameSync('binary_cache', join(this.dataDir, 'binary_cache'));
          return resolve();
        }
      });
      stderrStream.once('error', reject);
    });
  }
}
