#!/usr/bin/env node

var BT = require('../lib/bt'),
  bt = new BT(),
  argv = require('minimist')(process.argv.slice(2));

bt.fetch(
  argv
);