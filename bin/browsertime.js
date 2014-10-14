#!/usr/bin/env node

var BT = require('../lib/browsertime'),
  bt = new BT(),
  argv = require('minimist')(process.argv.slice(2), {
    alias: {
      'u': 'url',
      'b': 'browser',
      'n': 'runs',
      'w': 'size'
    }
  });

bt.fetch(
  argv
);