/**
 * Provides functionality to execute JavaScript code in the context of the current page.
 *
 * @class
 * @hideconstructor
 */
export class JavaScript {
    constructor(browser: any, pageCompleteCheck: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private pageCompleteCheck;
    /**
     * Executes a JavaScript script.
     *
     * @async
     * @param {string} js - The JavaScript code to execute.
     * @returns {Promise<*>} A promise that resolves with the result of the executed script.
     * @throws {Error} Throws an error if the JavaScript cannot be executed.
     */
    run(js: string): Promise<any>;
    /**
     * Executes a JavaScript script and waits for the page complete check to finish.
     *
     * @async
     * @param {string} js - The JavaScript code to execute.
     * @returns {Promise<*>} A promise that resolves with the result of the executed script and the completion of the page load.
     * @throws {Error} Throws an error if the JavaScript cannot be executed.
     */
    runAndWait(js: string): Promise<any>;
    /**
     * Executes synchronous privileged JavaScript.
     *
     * @async
     * @param {string} js - The privileged JavaScript code to execute.
     * @returns {Promise<*>} A promise that resolves with the result of the executed privileged script.
     * @throws {Error} Throws an error if the privileged JavaScript cannot be executed.
     */
    runPrivileged(js: string): Promise<any>;
    /**
     * Executes synchronous privileged JavaScript and waits for the page complete check to finish.
     *
     * @async
     * @param {string} js - The privileged JavaScript code to execute.
     * @returns {Promise<*>} A promise that resolves with the result of the executed privileged script and the completion of the page load.
     * @throws {Error} Throws an error if the privileged JavaScript cannot be executed.
     */
    runPrivilegedAndWait(js: string): Promise<any>;
    /**
     * Executes asynchronous privileged JavaScript.
     *
     * @async
     * @param {string} js - The asynchronous privileged JavaScript code to execute.
     * @returns {Promise<*>} A promise that resolves with the result of the executed asynchronous privileged script.
     * @throws {Error} Throws an error if the asynchronous privileged JavaScript cannot be executed.
     */
    runPrivilegedAsync(js: string): Promise<any>;
}
//# sourceMappingURL=javaScript.d.ts.map