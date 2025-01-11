#!/usr/bin/env node
import merge from 'lodash.merge';
import { getLogger } from '@sitespeed.io/log';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { Engine } from '../lib/core/engine/index.js';
import {
  findAndParseScripts,
  allScriptCategories,
  getScriptsForCategories
} from '../lib/support/browserScript.js';
import { configure } from '../lib/support/logging.js';
import { parseCommandLine } from '../lib/support/cli.js';
import { StorageManager } from '../lib/support/storageManager.js';
import { loadScript } from '../lib/support/engineUtils.js';
import { setProperty, getProperty } from '../lib/support/util.js';
import { isAndroidConfigured } from '../lib/android/index.js';

const log = getLogger('browsertime');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const delay = ms => new Promise(response => setTimeout(response, ms));

async function parseUserScripts(scripts) {
  if (!Array.isArray(scripts)) scripts = [scripts];
  const results = {};
  for (const script of scripts) {
    const code = await findAndParseScripts(path.resolve(script), 'custom');
    merge(results, code);
  }
  return results;
}

async function preWarmServer(urls, options) {
  const preWarmOptions = {
    browser: options.browser,
    iterations: 1,
    xvfb: options.xvfb,
    android: isAndroidConfigured(options),
    docker: options.docker,
    headless: options.headless
  };
  const chromeDevice = getProperty(options, 'chrome.android.deviceSerial');
  const firefoxDevice = getProperty(options, 'firefox.android.deviceSerial');
  const safariIos = getProperty(options, 'safari.ios');
  const safariDeviceName = getProperty(options, 'safari.deviceName');
  const safariDeviceUDID = getProperty(options, 'safari.deviceUDID ');

  if (isAndroidConfigured(options) && options.browser === 'chrome') {
    setProperty(preWarmOptions, 'chrome.android.package', 'com.android.chrome');
  }
  if (chromeDevice) {
    setProperty(preWarmOptions, 'chrome.android.deviceSerial', chromeDevice);
  } else if (firefoxDevice) {
    setProperty(preWarmOptions, 'firefox.android.deviceSerial', firefoxDevice);
  }

  if (safariIos) {
    setProperty(preWarmOptions, 'safari.ios', true);
    if (safariDeviceName) {
      setProperty(preWarmOptions, 'safari.deviceName', safariDeviceName);
    }
    if (safariDeviceUDID) {
      setProperty(preWarmOptions, 'safari.deviceUDID', safariDeviceUDID);
    }
  }

  let engine = new Engine(preWarmOptions);
  await engine.start();
  log.info('Start pre-testing/warming');
  await engine.runMultiple(urls, {});
  await engine.stop();
  log.info('Pre-testing done, closed the browser.');
  return delay(options.preWarmServerWaitTime || 5000);
}

async function run(urls, options) {
  if (options.debug) {
    log.info('Running Browsertime in debug mode.');
  }
  try {
    if (!options.resultDir) {
      let dir = 'browsertime-results';
      if (!existsSync(dir)) {
        mkdirSync(dir);
      }
    }

    let engine = new Engine(options);

    const scriptCategories = await allScriptCategories();
    let scriptsByCategory = await getScriptsForCategories(scriptCategories);

    if (options.script) {
      const userScripts = await parseUserScripts(options.script);
      scriptsByCategory = merge(scriptsByCategory, userScripts);
    }

    try {
      if (options.preWarmServer) {
        await preWarmServer(urls, options);
      }
      await engine.start();
      const result = await engine.runMultiple(urls, scriptsByCategory);
      let saveOperations = [];

      // TODO setup by name
      let firstUrl = urls[0];
      // if the url is an array, it's of the form [filename, function]
      if (Array.isArray(firstUrl)) {
        firstUrl = firstUrl[0];
      }
      const storageManager = new StorageManager(firstUrl, options);
      const harName = options.har ?? 'browsertime';
      const jsonName = options.output ?? 'browsertime';

      saveOperations.push(storageManager.writeJson(jsonName + '.json', result));

      if (result.har) {
        const useGzip = options.gzipHar === true;
        saveOperations.push(
          storageManager.writeJson(harName + '.har', result.har, useGzip)
        );
      }

      await Promise.all(saveOperations);

      const resultDirectory = path.relative(
        process.cwd(),
        storageManager.directory
      );

      // check for errors
      // If we have set the exit code in scripts, respect that
      if (process.exitCode === undefined) {
        for (let eachResult of result) {
          if (eachResult.markedAsFailure === 1) {
            process.exitCode = 1;
          }
          for (let errors of eachResult.errors) {
            if (errors.length > 0) {
              process.exitCode = 1;
            }
          }
        }
      }
      log.info(`Wrote data to ${resultDirectory}`);
    } finally {
      log.debug('Stopping Browsertime');
      try {
        await engine.stop();
        log.debug('Stopped Browsertime');
      } catch (error) {
        log.error('Error stopping Browsertime!', error);
        process.exitCode = 1;
      }
    }

    if (options.enableProfileRun || options.enableVideoRun) {
      log.info('Make one extra run to collect trace/video information');
      options.iterations = 1;
      if (options.enableProfileRun) {
        if (options.browser === 'firefox') {
          options.firefox.geckoProfiler = true;
          options.firefox.collectMozLog = true;
        } else if (options.browser === 'chrome') {
          options.chrome.timeline = true;
          options.cpu = true;
          options.chrome.enableTraceScreenshots = true;
          options.chrome.traceCategory = [
            'disabled-by-default-v8.cpu_profiler'
          ];
        }
      }
      if (options.enableVideoRun) {
        if (options.video === true) {
          log.error(
            'You can only configure video run if you do not collect any video'
          );
          // This is a hack to not get an error
          options.video = false;
          options.visualMetrics = false;
        } else {
          options.video = true;
          options.visualMetrics = true;
        }
      }
      const traceEngine = new Engine(options);
      await traceEngine.start();
      await traceEngine.runMultiple(urls, scriptsByCategory);
      await traceEngine.stop();
      log.info('Extra run finished');
    }
  } catch (error) {
    log.error('Error running browsertime', error);
    console.log(error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

let cliResult = parseCommandLine();
configure(cliResult.options);

/*
  Each url can be:
   - an url value
   - an array of tests. In that case it's a mapping containing
     theses values:
     - test: an async function containing the test to run
     - setUp: an async function for the preScript [optional]
     - tearDown: an async function for the postScript [optional]
*/
const tests = [];

for (const url of cliResult.urls) {
  // for each url, we try to load it as a script, that may contain
  // export a single function or an object containing setUp/test/tearDown functions.
  let testScript = await loadScript(url, cliResult.options);
  // if the value is an url or a not a single function,  we can return the original value
  if (typeof testScript == 'string' || testScript instanceof AsyncFunction) {
    tests.push(url);
    continue;
  }

  if (testScript.setUp) {
    if (!cliResult.options.preScript) {
      cliResult.options.preScript = [];
    }
    cliResult.options.preScript.push(testScript.setUp);
  }
  if (testScript.tearDown) {
    if (!cliResult.options.postScript) {
      cliResult.options.postScript = [];
    }
    cliResult.options.postScript.push(testScript.tearDown);
  }
  // here, url is the filename containing the script, and test the callable.
  tests.push([url, testScript.test]);
}
await run(tests, cliResult.options);
