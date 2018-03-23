'use strict';

const execa = require('execa');
const log = require('intel');

module.exports = async function(processName) {
  const scriptArgs = ['-9', processName];

  log.debug('Kill all processes ' + processName);

  return execa('pkill', scriptArgs).catch(() => {});
};
