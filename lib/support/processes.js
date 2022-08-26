'use strict';

const execa = require('execa');
module.exports = async function () {
  const { stdout } = await execa.command('ps aux | wc -l', { shell: true });
  return stdout;
};
