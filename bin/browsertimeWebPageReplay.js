#!/usr/bin/env node
import merge from 'lodash.merge';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Engine } from '../lib/core/engine/index.js';
import { configure as logging } from '../lib/support/logging.js';

async function runBrowsertime() {
  let yargsInstance = yargs(hideBin(process.argv));
  let parsed = yargsInstance
    .env('BROWSERTIME')
    .require(1, 'url')
    .option('browser', {
      alias: 'b',
      default: 'chrome',
      choices: ['chrome', 'firefox', 'edge'],
      describe: 'Specify browser'
    })
    .option('connectivity.latency', {
      default: undefined,
      group: 'connectivity'
    })
    .count('verbose')
    .alias('v', 'verbose');

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
    },
    chrome: {
      ignoreCertificateErrors: true
    }
  };

  const btOptions = merge({}, parsed.argv, defaultConfig);
  logging(parsed.argv);

  const engine = new Engine(btOptions);
  try {
    await engine.start();
    const result = await engine.runMultiple(parsed.argv._);
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

await runBrowsertime();
