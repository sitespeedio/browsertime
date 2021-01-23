'use strict';
const log = require('intel').getLogger('browsertime.command.devtoolsprotocol');

// https://chromedevtools.github.io/devtools-protocol/
class DevToolsProtocol {
  constructor(engineDelegate, browserName) {
    this.engineDelegate = engineDelegate;
    this.browserName = browserName;
  }

  async on(event, f) {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      try {
        const client = this.engineDelegate.getCDPClient();
        await client.on(event, f);
      } catch (e) {
        log.error(
          'Could not listen to DevToolsProtocol event %s with args %j',
          event,
          f
        );
        log.verbose(e);
        throw Error(
          `Could not listen to DevToolsProtocol event ${event} with args ${f}`
        );
      }
    } else {
      throw new Error('DevToolsProtocol only supported in Chrome and Edge');
    }
  }

  async sendAndGet(command, args) {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      try {
        const client = this.engineDelegate.getCDPClient();
        const result = await client.send(command, args);
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
        const client = this.engineDelegate.getCDPClient();
        return client.send(command, args);
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
