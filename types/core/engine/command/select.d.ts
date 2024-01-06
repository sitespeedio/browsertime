/**
 * Provides functionality to interact with `<select>` elements on a web page.
 *
 * @class
 * @hideconstructor
 */
export class Select {
    constructor(browser: any);
    /**
     * @private
     */
    private browser;
    /**
     * Selects an option in a `<select>` element by its ID and the value of the option.
     *
     * @async
     * @param {string} selectId - The ID of the `<select>` element.
     * @param {string} value - The value of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    selectByIdAndValue(selectId: string, value: string): Promise<void>;
    /**
     * Selects an option in a `<select>` element by its name and the value of the option.
     *
     * @async
     * @param {string} selectName - The name of the `<select>` element.
     * @param {string} value - The value of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    selectByNameAndValue(selectName: string, value: string): Promise<void>;
    /**
     * Selects an option in a `<select>` element by its ID and the index of the option.
     *
     * @async
     * @param {string} selectId - The ID of the `<select>` element.
     * @param {number} index - The index of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    selectByIdAndIndex(selectId: string, index: number): Promise<void>;
    /**
     * Selects an option in a `<select>` element by its name and the index of the option.
     *
     * @async
     * @param {string} selectName - The name of the `<select>` element.
     * @param {number} index - The index of the option to select.
     * @returns {Promise<void>} A promise that resolves when the option is selected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    selectByNameAndIndex(selectName: string, index: number): Promise<void>;
    /**
     * Deselects all options in a `<select>` element by its ID.
     *
     * @async
     * @param {string} selectId - The ID of the `<select>` element.
     * @returns {Promise<void>} A promise that resolves when all options are deselected.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    deselectById(selectId: string): Promise<void>;
    /**
     * Retrieves all option values in a `<select>` element by its ID.
     *
     * @async
     * @param {string} selectId - The ID of the `<select>` element.
     * @returns {Promise<string[]>} A promise that resolves with an array of the values of the options.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    getValuesById(selectId: string): Promise<string[]>;
    /**
     * Retrieves the value of the selected option in a `<select>` element by its ID.
     *
     * @async
     * @param {string} selectId - The ID of the `<select>` element.
     * @returns {Promise<string>} A promise that resolves with the value of the selected option.
     * @throws {Error} Throws an error if the `<select>` element is not found.
     */
    getSelectedValueById(selectId: string): Promise<string>;
}
//# sourceMappingURL=select.d.ts.map