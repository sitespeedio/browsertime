#!/usr/bin/env node

var Browsertime = require('../lib/browsertime'),
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

bt.fetch(
  argv
);