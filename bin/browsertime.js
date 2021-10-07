#!/usr/bin/env node
'use strict';

const Engine = require('../').Engine;
const browserScripts = require('../lib/support/browserScript');
const logging = require('../').logging;
const cli = require('../lib/support/cli');
const StorageManager = require('../lib/support/storageManager');
const merge = require('lodash.merge');
const fs = require('fs');
const path = require('path');
const log = require('intel').getLogger('browsertime');
const engineUtils = require('../lib/support/engineUtils');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const delay = ms => new Promise(res => setTimeout(res, ms));

async function parseUserScripts(scripts) {
  if (!Array.isArray(scripts)) scripts = [scripts];
  const results = {};
  for (const script of scripts) {
    const code = await browserScripts.findAndParseScripts(
      path.resolve(script),
      'custom'
    );
    merge(results, code);
  }
  return results;
}

async function preWarmServer(urls, options) {
  let engine = new Engine({
    browser: options.browser,
    iterations: 1,
    xvfb: options.xvfb,
    android: options.android
  });
  await engine.start();
  log.info('Start pre-testing/warming');
  await engine.runMultiple(urls, {});
  await engine.stop();
  log.info('Pre-testing done, closed the browser.');
  return delay(options.preWarmServerWaitTime || 5000);
}

async function run(urls, options) {
  try {
    if (!options.resultDir) {
      let dir = 'browsertime-results';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    }

    let engine = new Engine(options);

    const scriptCategories = await browserScripts.allScriptCategories;
    let scriptsByCategory = await browserScripts.getScriptsForCategories(
      scriptCategories
    );

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
      if (firstUrl instanceof Array) {
        firstUrl = firstUrl[0];
      }
      const storageManager = new StorageManager(firstUrl, options);
      const harName = options.har ? options.har : 'browsertime';
      const jsonName = options.output ? options.output : 'browsertime';

      saveOperations.push(storageManager.writeJson(jsonName + '.json', result));

      if (result.har) {
        const useGzip = options.gzipHar === true;
        saveOperations.push(
          storageManager.writeJson(harName + '.har', result.har, useGzip)
        );
      }
      await Promise.all(saveOperations);

      const resultDir = path.relative(process.cwd(), storageManager.directory);

      // check for errors
      for (let eachResult of result) {
        for (let errors of eachResult.errors) {
          if (errors.length > 0) {
            process.exitCode = 1;
          }
        }
      }
      log.info(`Wrote data to ${resultDir}`);
    } finally {
      log.debug('Stopping Browsertime');
      try {
        await engine.stop();
        log.debug('Stopped Browsertime');
      } catch (e) {
        log.error('Error stopping Browsertime!', e);
        process.exitCode = 1;
      }
    }
  } catch (e) {
    log.error('Error running browsertime', e);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

let cliResult = cli.parseCommandLine();

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

cliResult.urls.forEach(function convert(url) {
  // for each url, we try to load it as a script, that may contain
  // export a single function or an object containing setUp/test/tearDown functions.
  let testScript = engineUtils.loadScript(url);

  // if the value is an url or a not a single function,  we can return the original value
  if (typeof testScript == 'string' || testScript instanceof AsyncFunction) {
    tests.push(url);
    return;
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
});

logging.configure(cliResult.options);

run(tests, cliResult.options);
