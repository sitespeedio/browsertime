'use strict';

const execa = require('execa');

module.exports = async function () {
  const output = await execa.command('system_profiler SPDisplaysDataType', {
    shell: true
  });
  return output.stdout;
};
