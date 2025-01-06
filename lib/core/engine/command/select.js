import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.select');

/**
 * Provides functionality to interact with `<select>` elements on a web page.
 *
 * @class
 * @hideconstructor
 */
export class Select {
  constructor(browser) {
    /**
     * @private
     */
    this.browser = browser;
  }

  /**
   * Selects an option in a `<select>` element by its ID and the value of the option.
   *
   * @async
   * @param {string} selectId - The ID of the `<select>` element.
   * @param {string} value - The value of the option to select.
   * @returns {Promise<void>} A promise that resolves when the option is selected.
   * @throws {Error} Throws an error if the `<select>` element is not found.
   */
  async selectByIdAndValue(selectId, value) {
    try {
      const script = `const select = document.getElementById('${selectId}'); select.value = '${value}'; select.dispatchEvent(new Event('change'));`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not select value for select with id %s', selectId);
      log.verbose(error);
      throw new Error(`Could not select value for select with id ${selectId}`);
    }
  }

  /**
   * Selects an option in a `<select>` element by its name and the value of the option.
   *
   * @async
   * @param {string} selectName - The name of the `<select>` element.
   * @param {string} value - The value of the option to select.
   * @returns {Promise<void>} A promise that resolves when the option is selected.
   * @throws {Error} Throws an error if the `<select>` element is not found.
   */
  async selectByNameAndValue(selectName, value) {
    try {
      const script = `const select = document.querySelector("select[name='${selectName}']"); select.value = '${value}'; select.dispatchEvent(new Event('change'));`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not select value for select with name %s', selectName);
      log.verbose(error);
      throw new Error(
        `Could not select value for select with name ${selectName}`
      );
    }
  }

  /**
   * Selects an option in a `<select>` element by its ID and the index of the option.
   *
   * @async
   * @param {string} selectId - The ID of the `<select>` element.
   * @param {number} index - The index of the option to select.
   * @returns {Promise<void>} A promise that resolves when the option is selected.
   * @throws {Error} Throws an error if the `<select>` element is not found.
   */
  async selectByIdAndIndex(selectId, index) {
    try {
      const script = `const select = document.getElementById('${selectId}'); select.selectedIndex = ${index};select.dispatchEvent(new Event('change'));`;
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (error) {
      log.error(
        'Could not select value for select with id %s by index',
        selectId
      );
      log.verbose(error);
      throw new Error(`Could not select value for select with id ${selectId}`);
    }
  }

  /**
   * Selects an option in a `<select>` element by its name and the index of the option.
   *
   * @async
   * @param {string} selectName - The name of the `<select>` element.
   * @param {number} index - The index of the option to select.
   * @returns {Promise<void>} A promise that resolves when the option is selected.
   * @throws {Error} Throws an error if the `<select>` element is not found.
   */
  async selectByNameAndIndex(selectName, index) {
    try {
      const script = `const select = document.querySelector("select[name='${selectName}']"); select.selectedIndex = ${index};select.dispatchEvent(new Event('change'));`;
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (error) {
      log.error(
        'Could not select value for select with name %s by index',
        selectName
      );
      log.verbose(error);
      throw new Error(`Could not select value for select name ${selectName}`);
    }
  }

  /**
   * Deselects all options in a `<select>` element by its ID.
   *
   * @async
   * @param {string} selectId - The ID of the `<select>` element.
   * @returns {Promise<void>} A promise that resolves when all options are deselected.
   * @throws {Error} Throws an error if the `<select>` element is not found.
   */
  async deselectById(selectId) {
    try {
      const script = `const select = document.getElementById('${selectId}'); select.selectedIndex = -1;select.dispatchEvent(new Event('change'));`;
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (error) {
      log.error('Could not deleselect by select id %s', selectId);
      log.verbose(error);
      throw new Error(`Could not deleselect by select id  ${selectId}`);
    }
  }

  /**
   * Retrieves all option values in a `<select>` element by its ID.
   *
   * @async
   * @param {string} selectId - The ID of the `<select>` element.
   * @returns {Promise<string[]>} A promise that resolves with an array of the values of the options.
   * @throws {Error} Throws an error if the `<select>` element is not found.
   */
  async getValuesById(selectId) {
    const script = `const select = document.getElementById('${selectId}');
    const values = [];
    for (let option of select.options) {
      values.push(option.value);
    }
    return values;
    `;

    try {
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (error) {
      log.error('Could not get select options for id %s', selectId);
      log.verbose(error);
      throw new Error(`Could not get select options for id ${selectId}`);
    }
  }

  /**
   * Retrieves the value of the selected option in a `<select>` element by its ID.
   *
   * @async
   * @param {string} selectId - The ID of the `<select>` element.
   * @returns {Promise<string>} A promise that resolves with the value of the selected option.
   * @throws {Error} Throws an error if the `<select>` element is not found.
   */
  async getSelectedValueById(selectId) {
    try {
      const script = `const select = document.getElementById('${selectId}'); return select.options[select.selectedIndex].value;`;
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (error) {
      log.error('Could not select value for select with id %s', selectId);
      log.verbose(error);
      throw new Error(`Could not select value for select with id ${selectId}`);
    }
  }
}
