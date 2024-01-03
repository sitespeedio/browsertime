export class JavaScript {
    constructor(browser: any, pageCompleteCheck: any);
    browser: any;
    pageCompleteCheck: any;
    /**
     *  Run JavaScript.
     * @param {string} js
     * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser
     * @throws Will throw an error if the JavsScript can't run
     */
    run(js: string): Promise<any>;
    /**
     *  Run JavaScript and wait for page complete check to finish.
     * @param {string} js
     * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser and the page complete check is done.
     * @throws Will throw an error if the JavsScript can't run
     */
    runAndWait(js: string): Promise<any>;
    /**
     * Run synchronous privileged JavaScript.
     * @param {string} js
     * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser
     * @throws Will throw an error if the JavsScript can't run
     */
    runPrivileged(js: string): Promise<any>;
    /**
     * Run synchronous privileged JavaScript and wait for page complete check to finish.
     * @param {string} js
     * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser and the page complete check is done.
     * @throws Will throw an error if the JavsScript can't run
     */
    runPrivilegedAndWait(js: string): Promise<any>;
    /**
     * Run asynchronous privileged JavaScript.
     * @param {string} js
     * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser
     * @throws Will throw an error if the JavsScript can't run
     */
    runPrivilegedAsync(js: string): Promise<any>;
}
//# sourceMappingURL=javaScript.d.ts.map