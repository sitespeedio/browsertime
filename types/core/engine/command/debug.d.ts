export class Debug {
    constructor(browser: any, options: any);
    browser: any;
    options: any;
    /**
     * Add a breakpoint to script. The browser will wait at the breakpoint for user input.
     * @returns {Promise} Promise object that is fulfilled when the user move on from the breakpoint.
     */
    breakpoint(name: any): Promise<any>;
}
//# sourceMappingURL=debug.d.ts.map