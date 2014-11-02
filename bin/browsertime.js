#!/usr/bin/env node

require('whereis')('java', function searched(err) {
  // yep, we need Java for Selenium & the proxy
  if (err) {
    console.error(
      'Could not find Java, make sure it is installed in your $PATH');
  } else {
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
  }
});
