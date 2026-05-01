/**
 * Provides functionality to manage browser cookies.
 *
 * @class
 * @hideconstructor
 */
export class Cookie {
    constructor(browser: any);
    /**
     * @private
     */
    private driver;
    /**
     * Gets all cookies for the current page.
     *
     * @async
     * @returns {Promise<Array>} An array of cookie objects.
     */
    getAll(): Promise<any[]>;
    /**
     * Gets a specific cookie by name.
     *
     * @async
     * @param {string} name - The name of the cookie.
     * @returns {Promise<Object|undefined>} The cookie object, or undefined if not found.
     */
    get(name: string): Promise<any | undefined>;
    /**
     * Sets a cookie.
     *
     * @async
     * @param {string} name - The name of the cookie.
     * @param {string} value - The value of the cookie.
     * @param {Object} [options] - Optional cookie properties.
     * @param {string} [options.domain] - The domain the cookie is visible to.
     * @param {string} [options.path] - The cookie path.
     * @param {boolean} [options.secure] - Whether the cookie is secure.
     * @param {boolean} [options.httpOnly] - Whether the cookie is HTTP only.
     * @param {Date} [options.expiry] - When the cookie expires.
     * @returns {Promise<void>}
     */
    set(name: string, value: string, options?: {
        domain?: string;
        path?: string;
        secure?: boolean;
        httpOnly?: boolean;
        expiry?: Date;
    }): Promise<void>;
    /**
     * Deletes a specific cookie by name.
     *
     * @async
     * @param {string} name - The name of the cookie to delete.
     * @returns {Promise<void>}
     */
    delete(name: string): Promise<void>;
    /**
     * Deletes all cookies for the current page.
     *
     * @async
     * @returns {Promise<void>}
     */
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=cookie.d.ts.map