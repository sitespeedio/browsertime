'use strict';

const execa = require('execa');
const log = require('intel');

module.exports = function(processName) {
  const scriptArgs = [processName];

  log.debug('Kill all processes ' + processName);

  return execa('pkill', scriptArgs).catch();
};
