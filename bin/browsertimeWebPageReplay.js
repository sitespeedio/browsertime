#!/usr/bin/env node

'use strict';

let yargs = require('yargs'),
  browsertime = require('../'),
  merge = require('lodash.merge');

async function runBrowsertime() {
  let parsed = yargs
    .env('BROWSERTIME')
    .require(1, 'url')
    .option('browser', {
      alias: 'b',
      default: 'chrome',
      choices: ['chrome', 'firefox'],
      describe: 'Specify browser'
    });

  const defaultConfig = {
    iterations: 1,
    connectivity: {
      profile: 'native',
      downstreamKbps: undefined,
      upstreamKbps: undefined,
      latency: undefined,
      engine: 'external'
    },
    delay: 0,
    video: false,
    speedIndex: false,
    resultDir: '/tmp/browsertime'
  };

  const btOptions = merge({}, parsed.argv, defaultConfig);
  browsertime.logging.configure(parsed.argv);

  const engine = new browsertime.Engine(btOptions);
  await engine
    .start()
    .then(() => engine.run(parsed.argv._[0]))
    .finally(() => engine.stop());
}

runBrowsertime();
