'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime');

module.exports = async function(processName) {
  const scriptArgs = ['-9', processName];

  log.debug('Kill all processes ' + processName);

  return execa('pkill', scriptArgs, { reject: false });
};
