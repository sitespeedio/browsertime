export class Select {
    constructor(browser: any);
    browser: any;
    /**
     * Select value of a select by the selects id
     * @param {string} selectId The id of the select
     * @param {string} value The value of the option you want to set
     * @returns {Promise} Promise object represents when the option has been
     * set to the element
     * @throws Will throw an error if the select is not found
     */
    selectByIdAndValue(selectId: string, value: string): Promise<any>;
    /**
     * Select value of a select by the selects name
     * @param {string} selectName The name of the select
     * @param {string} value The value of the option you want to set
     * @returns {Promise} Promise object represents when the option has been
     * set to the element
     * @throws Will throw an error if the select is not found
     */
    selectByNameAndValue(selectName: string, value: string): Promise<any>;
    /**
     * Select value of a select index and  by the selects id
     * @param {string} selectId The id of the select
     * @param {number} index the index of the option you want to set
     * @returns {Promise} Promise object represents when the option has been
     * set to the element
     * @throws Will throw an error if the select is not found
     */
    selectByIdAndIndex(selectId: string, index: number): Promise<any>;
    /**
     * Select value of a select index and by the selects name
     * @param {string} selectName - the name of the select
     * @param {number} index - the index of the option you want to set
     * @returns {Promise} Promise object represents when the option has been
     * set to the element
     * @throws Will throw an error if the select is not found
     */
    selectByNameAndIndex(selectName: string, index: number): Promise<any>;
    /**
     * Deselect all options in a select.
     * @param {string} selectId
     * @returns {Promise} Promise object represents when options been deselected
     * @throws Will throw an error if the select is not found
     */
    deselectById(selectId: string): Promise<any>;
    /**
     * Get all option values in a select.
     * @param {string} selectId - the id of the select.
     * @returns {Promise} Promise object tha will return an array with the values of the select
     * @throws Will throw an error if the select is not found
     */
    getValuesById(selectId: string): Promise<any>;
    /**
     * Get the selected option value in a select.
     * @param {select} selectId the id of the select.
     * @returns {Promise} Promise object tha will return the value of the selected option.
     * @throws Will throw an error if the select is not found.
     */
    getSelectedValueById(selectId: select): Promise<any>;
}
//# sourceMappingURL=select.d.ts.map