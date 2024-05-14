/**
 * Provides functionality to control browser navigation such as back, forward, and refresh actions.
 *
 * @class
 * @hideconstructor
 */
export class Navigation {
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
     * Navigates backward in the browser's history.
     *
     * @async
     * @example await commands.navigation.back();
     * @param {Object} [options] - Additional options for navigation. Set {wait:true} to wait for the page complete check to run.
     * @returns {Promise<void>} A promise that resolves when the navigation action is completed.
     * @throws {Error} Throws an error if navigation fails.
     */
    back(options?: any): Promise<void>;
    /**
     * Navigates forward in the browser's history.
     *
     * @async
     * @example await commands.navigation.forward();
     * @param {Object} [options] - Additional options for navigation. Set {wait:true} to wait for the page complete check to run.
     * @returns {Promise<void>} A promise that resolves when the navigation action is completed.
     * @throws {Error} Throws an error if navigation fails.
     */
    forward(options?: any): Promise<void>;
    /**
     * Refreshes the current page.
     *
     * @async
     * @example await commands.navigation.refresh();
     * @param {Object} [options] - Additional options for refresh action. Set {wait:true} to wait for the page complete check to run.
     * @returns {Promise<void>} A promise that resolves when the page has been refreshed.
     * @throws {Error} Throws an error if refreshing the page fails.
     */
    refresh(options?: any): Promise<void>;
}
//# sourceMappingURL=navigation.d.ts.map