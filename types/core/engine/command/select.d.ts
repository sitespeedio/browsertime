/**
 * Provides functionality to interact with `<select>` elements on a web page.
 *
 * @class
 * @hideconstructor
 */
export class Select {
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
     * @private
     */
    private _waitForElement;
    /**
     * Selects an option in a select element using a unified selector string and a value.
     * Supports CSS selectors (default), and prefix-based strategies:
     * 'id:mySelect', 'name:country', 'class:dropdown'.
     *
     * @async
     * @param {string} selector - The selector string for the select element.
     * @param {string} value - The value of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the select element is not found.
     */
    run(selector: string, value: string): Promise<void>;
    /**
     * Selects an option in a select element by its visible text using a unified selector string.
     *
     * @async
     * @param {string} selector - The selector string for the select element.
     * @param {string} text - The visible text of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the select element or option is not found.
     */
    runByText(selector: string, text: string): Promise<void>;
    /**
     * Selects an option in a `<select>` element by its ID and the value of the option.
     *
     * @async
     * @private
     * @param {string} selectId - The ID of the `<select>` element.
     * @param {string} value - The value of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    private selectByIdAndValue;
    /**
     * Selects an option in a `<select>` element by its name and the value of the option.
     *
     * @async
     * @private
     * @param {string} selectName - The name of the `<select>` element.
     * @param {string} value - The value of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    private selectByNameAndValue;
    /**
     * Selects an option in a `<select>` element by its ID and the index of the option.
     *
     * @async
     * @private
     * @param {string} selectId - The ID of the `<select>` element.
     * @param {number} index - The index of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    private selectByIdAndIndex;
    /**
     * Selects an option in a `<select>` element by its name and the index of the option.
     *
     * @async
     * @private
     * @param {string} selectName - The name of the `<select>` element.
     * @param {number} index - The index of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    private selectByNameAndIndex;
    /**
     * Deselects all options in a `<select>` element by its ID.
     *
     * @async
     * @private
     * @param {string} selectId - The ID of the `<select>` element.
     * @returns {Promise<void>} A promise that resolves when all options are deselected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    private deselectById;
    /**
     * Retrieves all option values in a `<select>` element by its ID.
     *
     * @async
     * @private
     * @param {string} selectId - The ID of the `<select>` element.
     * @returns {Promise<string[]>} A promise that resolves with an array of the values of the options.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    private getValuesById;
    /**
     * Retrieves the value of the selected option in a `<select>` element by its ID.
     *
     * @async
     * @private
     * @param {string} selectId - The ID of the `<select>` element.
     * @returns {Promise<string>} A promise that resolves with the value of the selected option.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    private getSelectedValueById;
}
//# sourceMappingURL=select.d.ts.map