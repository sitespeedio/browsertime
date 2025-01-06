import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.devtoolsprotocol');

/**
 * Manages interactions with the Chrome DevTools Protocol for Chrome and Edge browsers.
 * Allows sending commands and setting up event listeners via the protocol.
 *
 * @class
 * @hideconstructor
 * @see https://chromedevtools.github.io/devtools-protocol/
 */
export class ChromeDevelopmentToolsProtocol {
  constructor(engineDelegate, browserName) {
    /**
     * @private
     */
    this.engineDelegate = engineDelegate;
    /**
     * @private
     */
    this.browserName = browserName;
  }

  /**
   * Sets up an event listener for a specific DevTools Protocol event.
   *
   * @async
   * @param {string} event - The name of the event to listen for.
   * @param {Function} f - The callback function to execute when the event is triggered.
   * @throws {Error} Throws an error if the browser is not supported or if setting the listener fails.
   */
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

  /**
   * Sends a command to the DevTools Protocol and returns the result.
   *
   * @async
   * @example const domCounters = await commands.cdp.sendAndGet('Memory.getDOMCounters');
   * @see https://chromedevtools.github.io/devtools-protocol/
   * @param {string} command - The DevTools Protocol command to send.
   * @param {Object} arguments_ - The arguments for the command.
   * @throws {Error} Throws an error if the browser is not supported or if the command fails.
   * @returns {Promise<Object>} The result of the command execution.
   */
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

  /**
   * Retrieves the raw client for the DevTools Protocol.
   * @example const cdpClient = commands.cdp.getRawClient();
   * @returns {Object} The raw DevTools Protocol client.
   * @throws {Error} Throws an error if the browser is not supported.
   * @see https://github.com/cyrus-and/chrome-remote-interface
   */
  getRawClient() {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      return this.engineDelegate.getCDPClient().getRawClient();
    } else {
      throw new Error('DevToolsProtocol only supported in Chrome and Edge');
    }
  }

  /**
   * Sends a command to the DevTools Protocol.
   *
   * @async
   * @example await commands.cdp.send('');
   * @see https://chromedevtools.github.io/devtools-protocol/
   * @param {string} command - The DevTools Protocol command to send.
   * @param {Object} arguments_ - The arguments for the command.
   * @throws {Error} Throws an error if the browser is not supported or if the command fails.
   * @returns {Promise<void>} A promise that resolves when the command has been sent.
   */
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
