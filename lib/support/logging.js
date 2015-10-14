'use strict';

let Promise = require('bluebird'),
  log = require('intel');

module.exports.configure = function configure(options) {
  let level = log.INFO;
  switch (options.verbose) {
    case 1:
      level = log.DEBUG;
      break;
    case 2:
      level = log.VERBOSE;
      break;
    case 3:
      level = log.TRACE;
      break;
    default:
      break;
  }

  if (level <= log.CRITICAL) { // TODO change the threshold to VERBOSE before releasing 1.0
    Promise.longStackTraces();
  }

  if (options.silent) {
    level = log.NONE;
  }

  log.basicConfig({
    'format': '[%(date)s] %(message)s',
    'level': level
  });

};
