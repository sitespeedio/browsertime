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

async function run(urls, options) {
  try {
    let dir = 'browsertime-results';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
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
      await engine.start();
      const result = await engine.runMultiple(urls, scriptsByCategory);
      let saveOperations = [];

      // TODO setup by name
      const storageManager = new StorageManager(urls[0], options);
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
      for (let eachRestult of result) {
        for (let errors of eachRestult.errors) {
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

logging.configure(cliResult.options);

run(cliResult.urls, cliResult.options);
