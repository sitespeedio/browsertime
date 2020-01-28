'use strict';
const log = require('intel').getLogger('browsertime.command.devtoolsprotocol');

// https://chromedevtools.github.io/devtools-protocol/
class DevToolsProtocol {
  constructor(engineDelegate, browserName) {
    this.engineDelegate = engineDelegate;
    this.browserName = browserName;
  }

  async sendAndGet(command, args) {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      try {
        const result = await this.engineDelegate.sendAndGetDevToolsCommand(
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
    } else {
      throw new Error('DevToolsProtocol only supported in Chrome and Edge');
    }
  }

  async send(command, args) {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      try {
        return this.engineDelegate.sendDevToolsCommand(command, args);
      } catch (e) {
        log.error(
          'Could not send to DevToolsProtocol command %s with args %j',
          command,
          args
        );
        log.verbose(e);
        `Could not send to DevToolsProtocol command ${command} with args ${args}`;
      }
    } else {
      throw new Error('DevToolsProtocol only supported in Chrome and Edge');
    }
  }
}
module.exports = DevToolsProtocol;
