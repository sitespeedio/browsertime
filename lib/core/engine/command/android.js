'use strict';

const log = require('intel').getLogger('browsertime.command.android');
const {
  createAndroidConnection,
  isAndroidConfigured
} = require('../../../android');

class Android {
  constructor(options) {
    this.a = createAndroidConnection(options);
    this.options = options;
  }

  /**
   * Run a shell command on your Android phone.
   * @param {string} command The shell command to run on your phone.
   * @returns {Promise} Promise object represents when the command has finished running.
   * @throws Will throw an error Android isn't configured or something goes wrong
   */
  async shell(command) {
    if (isAndroidConfigured(this.options)) {
      log.debug('Run %s', command);
      try {
        return this.a._runCommand(command);
      } catch (e) {
        log.error('Could not run shell command %s', command, e);
        throw Error(`Could not run Android shell commmand ${command}`);
      }
    } else throw new Error('Android is not configured');
  }

  /**
   * Run a shell command and get hold of the output.
   * @param {string} command The shell command to run on your phone.
   * @returns {Promise} Promise object represents that returns the output from the command.
   * @throws Will throw an error Android isn't configured or something goes wrong
   */
  async shellAndGet(command) {
    if (isAndroidConfigured(this.options)) {
      log.debug('Run %s', command);
      try {
        return this.a._runCommandAndGet(command);
      } catch (e) {
        log.error('Could not run shell command %s', command, e);
        throw Error(`Could not run Android shell commmand ${command}`);
      }
    } else throw new Error('Android is not configured');
  }
}

module.exports = Android;
