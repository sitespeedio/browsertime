#!/usr/bin/env node
'use strict';

let Engine = require('../').Engine,
  browserScripts = require('../lib/support/browserScript'),
  logging = require('../').logging,
  util = require('../lib/support/util'),
  cli = require('../lib/support/cli'),
  StorageManager = require('../lib/support/storageManager'),
  Promise = require('bluebird'),
  merge = require('lodash.merge'),
  forEach = require('lodash.foreach'),
  pick = require('lodash.pick'),
  fs = require('fs'),
  path = require('path'),
  log = require('intel');

Promise.promisifyAll(fs);

function parseUserScripts(scripts) {
  if (!Array.isArray(scripts))
    scripts = [scripts];

  return Promise.reduce(scripts, (results, script) =>
      browserScripts.findAndParseScripts(path.resolve(script), 'custom')
        .then((scripts) => merge(results, scripts)),
    {});
}

// 1200 -> 1.2
function fmt(msec, d) {
  d=d||2;
  return (msec/1000).toFixed(d).replace(/.0+$/,'');
}

function formatMetric(name, metric, multiple) {
    if (metric === null)
        return metric;

    let formatted = `${name}: ${fmt(metric.mean)}s`;
    if (multiple) {
        formatted += ` (±${fmt(metric.mdev)})`;
    }
    return formatted;
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
  let scriptsByCategory = browserScripts.getScriptsForCategories(scriptCategories);

  if (options.script) {
    const userScripts = parseUserScripts(options.script);
    scriptsByCategory = Promise.join(scriptsByCategory, userScripts,
      (scriptsByCategory, userScripts) => merge(scriptsByCategory, userScripts));
  }

  engine.start()
    .then(function() {
      return engine.run(url, scriptsByCategory);
    })
    .then(function(result) {
      let saveOperations = [];

      const storageManager = new StorageManager(url, options);
      const harName = (options.har) ? (options.har) : 'browsertime';
      const jsonName = (options.output) ? (options.output) : 'browsertime';
      const btData = pick(result, ['info', 'browserScripts', 'statistics', 'visualMetrics']);
      if (!util.isEmpty(btData)) {
        saveOperations.push(storageManager.writeJson(jsonName + '.json', btData));
      }
      if (result.har) {
        saveOperations.push(storageManager.writeJson(harName + '.har', result.har));
      }
      forEach(result.extras, (value, key) =>
        saveOperations.push(storageManager.writeData(key, value)));
      forEach(result.screenshots, (value, index) =>
        saveOperations.push(storageManager.writeData(`screenshot-${index}.png`, value)));

      return Promise.all(saveOperations)
        .then(() => {
          log.info('Wrote data to %s', path.relative(process.cwd(), storageManager.directory));
          return result;
        });
    })
    .tap((result) => {
      // don't bother if no statistics or silent x2
      if (!result.statistics || !result.statistics.timings || !result.statistics.timings.pageTimings || options.silent > 1) return result;

      let run = result.browserScripts[0].timings,
        nRuns = result.browserScripts.length,
        pt = result.statistics.timings.pageTimings,
        t = result.statistics.timings,
        m = nRuns > 1,
        lines = [
          `${run.resourceTimings.length} requests`,
          formatMetric('firstPaint', t.firstPaint, m),
          formatMetric('DOMContentLoaded', pt.domContentLoadedTime, m),
          formatMetric('Load', pt.pageLoadTime, m),
          formatMetric('rumSpeedIndex', t.rumSpeedIndex, m),
        ],
        note = m ? ` (${nRuns} runs)` : '';

      lines = lines.filter(Boolean).join(', ');
      log.info(`${lines}${note}`);
      return result;
    })
    .catch(function(e) {
      log.error('Error running browsertime', e);
      throw e;
    })
    .finally(function() {
      log.debug('Stopping Browsertime');
      return engine.stop()
        .tap(() => {
          log.debug('Stopped Browsertime');
        })
        .catch((e) => {
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

if (log.isEnabledFor(log.CRITICAL)) { // TODO change the threshold to VERBOSE before releasing 1.0
  Promise.longStackTraces();
}

run(cliResult.url, cliResult.options);
