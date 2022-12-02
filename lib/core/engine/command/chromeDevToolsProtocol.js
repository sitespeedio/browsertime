import intel from 'intel';
const log = intel.getLogger('browsertime.command.devtoolsprotocol');

// https://chromedevtools.github.io/devtools-protocol/
export class ChromeDevelopmentToolsProtocol {
  constructor(engineDelegate, browserName) {
    this.engineDelegate = engineDelegate;
    this.browserName = browserName;
  }

  async on(event, f) {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      try {
        const client = this.engineDelegate.getCDPClient();
        await client.on(event, f);
      } catch (error) {
        log.error(
          'Could not listen to DevToolsProtocol event %s with args %j',
          event,
          f
        );
        log.verbose(error);
        throw new Error(
          `Could not listen to DevToolsProtocol event ${event} with args ${f}`
        );
      }
    } else {
      throw new Error('DevToolsProtocol only supported in Chrome and Edge');
    }
  }

  async sendAndGet(command, arguments_) {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      try {
        const client = this.engineDelegate.getCDPClient();
        const result = await client.send(command, arguments_);
        return result;
      } catch (error) {
        log.error(
          'Could not sendAndGet to DevToolsProtocol command %s with args %j',
          command,
          arguments_
        );
        log.verbose(error);
        throw new Error(
          `Could not sendAndGet to DevToolsProtocol command ${command} with args ${arguments_}`
        );
      }
    } else {
      throw new Error('DevToolsProtocol only supported in Chrome and Edge');
    }
  }

  async send(command, arguments_) {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      try {
        const client = this.engineDelegate.getCDPClient();
        return client.send(command, arguments_);
      } catch (error) {
        log.error(
          'Could not send to DevToolsProtocol command %s with args %j',
          command,
          arguments_
        );
        log.verbose(error);
        `Could not send to DevToolsProtocol command ${command} with args ${arguments_}`;
      }
    } else {
      throw new Error('DevToolsProtocol only supported in Chrome and Edge');
    }
  }
}
