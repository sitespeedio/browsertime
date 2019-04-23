'use strict';
const log = require('intel').getLogger('browsertime.command.devtoolsprotocol');

// https://chromedevtools.github.io/devtools-protocol/
class DevToolsProtocol {
  constructor(browser, browserName) {
    this.browser = browser;
    this.browserName = browserName;
  }

  async sendAndGet(command, args) {
    if (this.browserName === 'firefox') {
      throw new Error('DevToolsProtocol only supported in Chrome');
    }
    try {
      const result = await this.browser.sendAndGetDevToolsCommand(
        command,
        args
      );
      return result;
    } catch (e) {
      log.error(
        'Could not sendAndGet to DevToolsProtocol command %s with args %j',
        command,
        args
      );
      log.verbose(e);
      throw Error(
        `Could not sendAndGet to DevToolsProtocol command ${command} with args ${args}`
      );
    }
  }

  async send(command, args) {
    if (this.browserName === 'firefox') {
      throw new Error('DevToolsProtocol only supported in Chrome');
    }
    try {
      await this.browser.sendDevToolsCommand(command, args);
    } catch (e) {
      log.error(
        'Could not send to DevToolsProtocol command %s with args %j',
        command,
        args
      );
      log.verbose(e);
      `Could not send to DevToolsProtocol command ${command} with args ${args}`;
    }
  }
}
module.exports = DevToolsProtocol;
