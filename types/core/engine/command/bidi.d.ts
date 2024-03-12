/**
 * Manages interactions using Bidi. At the moment this only works for Firefox
 * but Chrome and maybe other browsers will support it in the future.
 * @class
 * @hideconstructor
 * @see https://w3c.github.io/webdriver-bidi/
 */
export class Bidi {
    constructor(engineDelegate: any, browserName: any);
    /**
     * @private
     */
    private engineDelegate;
    /**
     * @private
     */
    private browserName;
    /**
     * Add a fanction that will get the events that you subscribes.
     * @async
     * @param {Function} f - The callback function to handle incoming messages. The function will get an event passed on to it. Remember to subscribe to the event.
     * @throws {Error} Throws an error if the method is called in a browser other than Firefox.
     */
    onMessage(f: Function): Promise<void>;
    /**
     * Retrieves the raw client for Bidi.
     * @async
     * @example const bidi = await commands.bidi.getRawClient();
     * @returns {Promise<Object>} A promise that resolves to the Bidi client.
     * @throws {Error} Throws an error if the browser is not supported.
     */
    getRawClient(): Promise<any>;
    /**
     * Subscribe to a event.
     * @async
     * @param {string} messageType The type of message to subscribe to.
     * @returns {Promise<Object>} A promise that resolves you have subscribed.
     * @throws {Error} Throws an error if the method is called in a browser other than Firefox.
     */
    subscribe(messageType: string): Promise<any>;
    /**
     * Unsubscribe to an event.
     * @async
     * @param {string} messageType  The type of message to unsubscribe to.
     * @returns  {Promise<Object>} A promise that resolves you have unsubscribed.
     * @throws {Error} Throws an error if the method is called in a browser other than Firefox.
     */
    unsubscribe(messageType: string): Promise<any>;
    /**
     * Sends a command using Bidi.
     *
     * @async
     * @example await commands.bidi.send({});
     * @param {Object} parameters - The paramaters for the command.
     * @throws {Error} Throws an error if the browser is not supported or if the command fails.
     * @returns {Promise<Object>} A promise that resolves when the command has been sent.
     */
    send(parameters: any): Promise<any>;
}
//# sourceMappingURL=bidi.d.ts.map