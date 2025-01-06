import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.bidi');

/**
 * Manages interactions using Bidi. At the moment this only works for Firefox
 * but Chrome and maybe other browsers will support it in the future.
 * @class
 * @hideconstructor
 * @see https://w3c.github.io/webdriver-bidi/
 */
export class Bidi {
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
   * Add a fanction that will get the events that you subscribes.
   * @async
   * @example await commands.bidi.onMessage(function(event) {
   *  const myEvent = JSON.parse(Buffer.from(event.toString()));
   *  console.log(myEvent);
   * });
   * @param {Function} f - The callback function to handle incoming messages. The function will get an event passed on to it. Remember to subscribe to the event.
   * @throws {Error} Throws an error if the method is called in a browser other than Firefox.
   */
  async onMessage(f) {
    if (this.browserName === 'firefox') {
      const client = await this.engineDelegate.getBidi();
      const ws = await client.socket;
      ws.on('message', f);
    } else {
      throw new Error('Bidi only supported in Firefox');
    }
  }

  /**
   * Retrieves the raw client for Bidi.
   * @example const bidi = commands.bidi.getRawClient();
   * @returns {Promise<Object>} A promise that resolves to the Bidi client.
   * @throws {Error} Throws an error if the browser is not supported.
   */
  getRawClient() {
    if (this.browserName === 'firefox') {
      return this.engineDelegate.getBidi();
    } else {
      throw new Error('Bidi only supported in Firefox');
    }
  }

  /**
   * Subscribe to a event.
   * @async
   * @example // Subscribe to requests before they are sent
   * await commands.bidi.subscribe('network.beforeRequestSent');
   * @param {string} messageType The type of message to subscribe to.
   * @returns {Promise<Object>} A promise that resolves you have subscribed.
   * @throws {Error} Throws an error if the method is called in a browser other than Firefox.
   */
  async subscribe(messageType) {
    if (this.browserName === 'firefox') {
      const client = await this.engineDelegate.getBidi();
      return client.subscribe(messageType, [
        await this.engineDelegate.getWindowHandle()
      ]);
    } else {
      throw new Error('Bidi only supported in Firefox');
    }
  }

  /**
   * Unsubscribe to an event.
   * @async
   *  @example // Unsubscribe to requests before they are sent
   * await commands.bidi.unsubscribe('network.beforeRequestSent');
   * @param {string} messageType  The type of message to unsubscribe to.
   * @returns  {Promise<Object>} A promise that resolves you have unsubscribed.
   * @throws {Error} Throws an error if the method is called in a browser other than Firefox.
   */
  async unsubscribe(messageType) {
    if (this.browserName === 'firefox') {
      const client = await this.engineDelegate.getBidi();
      return client.unsubscribe(messageType, [
        this.engineDelegate.getWindowHandle()
      ]);
    } else {
      throw new Error('Bidi only supported in Firefox');
    }
  }

  /**
   * Sends a command using Bidi.
   *
   * @async
   * @example
   *  const params = {
   *   method: 'script.addPreloadScript',
   *   params: {
   *     functionDeclaration: "function() {alert('hello')}"
   *    }
   *  };
   * await commands.bidi.send(params);
   * @param {Object} parameters - The paramaters for the command.
   * @throws {Error} Throws an error if the browser is not supported or if the command fails.
   * @returns {Promise<Object>} A promise that resolves when the command has been sent.
   */
  async send(parameters) {
    if (this.browserName === 'firefox') {
      try {
        const client = await this.engineDelegate.getBidi();
        return client.send(parameters);
      } catch (error) {
        log.error(
          'Could not send to Bidi command %j, error: %s',
          parameters,
          error
        );
        log.verbose(error);
        `Could not send to Bidi command ${parameters} `;
      }
    } else {
      throw new Error('Bidi only supported in Firefox');
    }
  }
}
