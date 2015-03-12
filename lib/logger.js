/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var winston = require('winston'),
    path = require('path');

var DEFAULT_LOG = 'browsertime';

module.exports = {
  getLog: function(name) {
    name = name || DEFAULT_LOG;

    return winston.loggers.get(name);
  },

  addLog: function(name, options) {
    name = name || DEFAULT_LOG;
    options = options || {};

    if (winston.loggers.has(name)) {
      return winston.loggers.get(name);
    }

    var logPath = path.join(options.logDir || '', name + '.log');
    var logLevel = options.verbose ? 'verbose' : 'info';

    var winstonOpts = {
      file: {
        level: logLevel,
        json: false,
        filename: logPath
      },
      console: {
        level: logLevel,
        colorize: !options.noColor,
        showLevel: false,
        silent: !!options.silent
      }
    };

    return winston.loggers.add(name, winstonOpts);
  }
};
