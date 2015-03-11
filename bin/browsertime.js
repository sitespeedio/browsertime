#!/usr/bin/env node
'use strict';

var async = require('async');

var proxy = require('../lib/proxy');
var logger = require('../lib/logger');
var browsers = require('../lib/browsers');
var browserListenerProxy = require('../lib/proxy/browserListenerProxy');

require('whereis')('java', function searched(err) {
  // yep, we need Java for Selenium & the proxy
  if (err) {
    console.error(
      'Could not find Java, make sure it is installed in your $PATH');
  } else {
    var Browsertime = require('../lib/browsertime'),
      cli = require('../lib/cli'),
      argv = require('minimist')(process.argv.slice(2), {
        alias: {
          'u': 'url',
          'h': 'help',
          'b': 'browser',
          'n': 'runs',
          'w': 'size',
          'f': 'filename',
          'v': 'verbose',
          'V': 'version'
        }
      });

    cli.verifyInput(argv);

    logger.addLog(null, argv);

    var p = proxy.createProxy(argv);

    async.series([
          function (cb) {
            p.launchProcess(cb);
          },
          function (cb) {
            browsers.setProxy(p);

            var bt = new Browsertime(browsers);

            browserListenerProxy.setup(bt, p, argv);

            bt.fetch(argv, cb);
          }
        ],
        function (e) {
          if (e) {
            logger.getLog().error(e.message);
          }
          p.stopProcess(function() {});

          process.exit(e ? 1 : 0);
        });
  }
});
