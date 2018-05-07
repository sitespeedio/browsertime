#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const browsertime = require('../');
const merge = require('lodash.merge');

async function runBrowsertime() {
  let parsed = yargs
    .env('BROWSERTIME')
    .require(1, 'url')
    .option('browser', {
      alias: 'b',
      default: 'chrome',
      choices: ['chrome', 'firefox'],
      describe: 'Specify browser'
    })
    .option('connectivity.latency', {
      default: undefined,
      group: 'connectivity'
    });

  const defaultConfig = {
    iterations: 1,
    connectivity: {
      downstreamKbps: undefined,
      upstreamKbps: undefined,
      latency: undefined,
      engine: 'external',
      localhost: true
    },
    delay: 0,
    video: false,
    visualMetrics: false,
    resultDir: '/tmp/browsertime',
    screenshotParams: {
      type: 'jpg'
    }
  };

  const btOptions = merge({}, parsed.argv, defaultConfig);
  browsertime.logging.configure(parsed.argv);

  const engine = new browsertime.Engine(btOptions);
  try {
    await engine.start();
    const result = await engine.run(parsed.argv._[0]);
    for (let errors of result.errors) {
      if (errors.length > 0) {
        process.exitCode = 1;
      }
    }
  } finally {
    await engine.stop();
    process.exit();
  }
}

runBrowsertime();
