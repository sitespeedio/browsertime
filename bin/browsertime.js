#!/usr/bin/env node

var Browsertime = require('../lib/browsertime'),
cli = require('../lib/cli'),
  bt = new Browsertime(),
  argv = require('minimist')(process.argv.slice(2), {
    alias: {
      'u': 'url',
      'b': 'browser',
      'n': 'runs',
      'w': 'size',
      'f': 'filename'
    }
  });

cli.verifyInput(argv);

bt.fetch(
  argv
);
