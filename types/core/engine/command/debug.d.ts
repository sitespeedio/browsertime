/**
 * Provides debugging capabilities within a browser automation script.
 * It allows setting breakpoints to pause script execution and inspect the current state.
 *
 * @class
 * @hideconstructor
 */
export class Debug {
    constructor(browser: any, options: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private options;
    /**
     * Adds a breakpoint to the script. The browser will pause at the breakpoint, waiting for user input to continue.
     * This is useful for debugging and inspecting the browser state at a specific point in the script.
     *
     * @example await commands.debug.breakpoint('break');
     * @async
     * @param {string} [name] - An optional name for the breakpoint for logging purposes.
     * @returns {Promise<void>} A promise that resolves when the user chooses to continue from the breakpoint.
     */
    breakpoint(name?: string): Promise<void>;
}
//# sourceMappingURL=debug.d.ts.map