/**
 * Manages interactions with the Chrome DevTools Protocol for Chrome and Edge browsers.
 * Allows sending commands and setting up event listeners via the protocol.
 *
 * @class
 * @hideconstructor
 * @see https://chromedevtools.github.io/devtools-protocol/
 */
export class ChromeDevelopmentToolsProtocol {
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
     * Sets up an event listener for a specific DevTools Protocol event.
     *
     * @async
     * @param {string} event - The name of the event to listen for.
     * @param {Function} f - The callback function to execute when the event is triggered.
     * @throws {Error} Throws an error if the browser is not supported or if setting the listener fails.
     */
    on(event: string, f: Function): Promise<void>;
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
    sendAndGet(command: string, arguments_: any): Promise<any>;
    /**
     * Retrieves the raw client for the DevTools Protocol.
     * @example const cdpClient = commands.cdp.getRawClient();
     * @returns {Object} The raw DevTools Protocol client.
     * @throws {Error} Throws an error if the browser is not supported.
     * @see https://github.com/cyrus-and/chrome-remote-interface
     */
    getRawClient(): any;
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
    send(command: string, arguments_: any): Promise<void>;
}
//# sourceMappingURL=chromeDevToolsProtocol.d.ts.map