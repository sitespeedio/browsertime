#!/usr/bin/env node

'use strict';

const fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  parser = require('../lib/support/chromePerflogParser');

Promise.promisifyAll(fs);

if (process.argv.length !== 3) {
  console.error('Specify a path to a perflog file');
  process.exit(1);
}

const perflogPath = process.argv[2];

fs.readFileAsync(path.resolve(perflogPath), 'utf8')
  .then(JSON.parse)
  .map((entry) => parser.eventFromSeleniumLogEntry(entry))
  .then((events) => parser.harFromEvents(events))
  .then((har) => JSON.stringify(har, null, 2))
  .then((har) => fs.writeFileAsync(path.basename(perflogPath, '.json') + '.har', har, 'utf8'));
