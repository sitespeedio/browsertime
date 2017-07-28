#!/usr/bin/env node
'use strict';

let Engine = require('../').Engine,
  browserScripts = require('../lib/support/browserScript'),
  logging = require('../').logging,
  cli = require('../lib/support/cli'),
  StorageManager = require('../lib/support/storageManager'),
  Promise = require('bluebird'),
  merge = require('lodash.merge'),
  isEmpty = require('lodash.isempty'),
  forEach = require('lodash.foreach'),
  pick = require('lodash.pick'),
  fs = require('fs'),
  path = require('path'),
  log = require('intel');

Promise.promisifyAll(fs);

function parseUserScripts(scripts) {
  if (!Array.isArray(scripts)) scripts = [scripts];

  return Promise.reduce(
    scripts,
    (results, script) =>
      browserScripts
        .findAndParseScripts(path.resolve(script), 'custom')
        .then(scripts => merge(results, scripts)),
    {}
  );
}

function run(url, options) {
  let dir = 'browsertime-results';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  let engine = new Engine(options);

  log.info('Running %s for url: %s', options.browser, url);
  if (log.isEnabledFor(log.DEBUG)) {
    log.debug('Running with options: %:2j', options);
  }

  const scriptCategories = browserScripts.allScriptCategories;
  let scriptsByCategory = browserScripts.getScriptsForCategories(
    scriptCategories
  );

  if (options.script) {
    const userScripts = parseUserScripts(options.script);
    scriptsByCategory = Promise.join(
      scriptsByCategory,
      userScripts,
      (scriptsByCategory, userScripts) => merge(scriptsByCategory, userScripts)
    );
  }

  engine
    .start()
    .then(function() {
      return engine.run(url, scriptsByCategory);
    })
    .then(function(result) {
      let saveOperations = [];

      const storageManager = new StorageManager(url, options);
      const harName = options.har ? options.har : 'browsertime';
      const jsonName = options.output ? options.output : 'browsertime';
      const btData = pick(result, [
        'info',
        'browserScripts',
        'statistics',
        'visualMetrics',
        'timestamps'
      ]);
      if (!isEmpty(btData)) {
        saveOperations.push(
          storageManager.writeJson(jsonName + '.json', btData)
        );
      }
      if (result.har) {
        saveOperations.push(
          storageManager.writeJson(harName + '.har', result.har)
        );
      }
      forEach(result.extraJson, (value, key) =>
        saveOperations.push(storageManager.writeJson(key, value))
      );
      forEach(result.screenshots, (value, index) =>
        saveOperations.push(
          storageManager.writeData(`screenshot-${index}.png`, value)
        )
      );

      return Promise.all(saveOperations).then(() => {
        log.info(
          'Wrote data to %s',
          path.relative(process.cwd(), storageManager.directory)
        );
        return result;
      });
    })
    .catch(function(e) {
      log.error('Error running browsertime', e);
      throw e;
    })
    .finally(function() {
      log.debug('Stopping Browsertime');
      return engine
        .stop()
        .tap(() => {
          log.debug('Stopped Browsertime');
        })
        .catch(e => {
          log.error('Error stopping Browsertime!', e);

          process.exitCode = 1;
        });
    })
    .catch(function() {
      process.exitCode = 1;
    })
    .finally(process.exit); // explicitly exit to avoid a hanging process
}

let cliResult = cli.parseCommandLine();

logging.configure(cliResult.options);

if (log.isEnabledFor(log.CRITICAL)) {
  // TODO change the threshold to VERBOSE before releasing 1.0
  Promise.longStackTraces();
}

run(cliResult.url, cliResult.options);
