'use strict';

const log = require('intel').getLogger('browsertime.command.select');

class Select {
  constructor(browser) {
    this.browser = browser;
  }

  /**
   * Select value of a select by the selects id
   * @param {string} selectId The id of the select
   * @param {string} value The value of the option you want to set
   * @returns {Promise} Promise object represents when the option has been
   * set to the element
   * @throws Will throw an error if the select is not found
   */
  async selectByIdAndValue(selectId, value) {
    try {
      const script = `const select = document.getElementById('${selectId}'); select.value = '${value}'; select.dispatchEvent(new Event('change'));`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not select value for select with id %s', selectId);
      log.verbose(e);
      throw Error(`Could not select value for select with id ${selectId}`);
    }
  }

  /**
   * Select value of a select by the selects name
   * @param {string} selectName The name of the select
   * @param {string} value The value of the option you want to set
   * @returns {Promise} Promise object represents when the option has been
   * set to the element
   * @throws Will throw an error if the select is not found
   */
  async selectByNameAndValue(selectName, value) {
    try {
      const script = `const select = document.querySelector("select[name='${selectName}']"); select.value = '${value}'; select.dispatchEvent(new Event('change'));`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not select value for select with name %s', selectName);
      log.verbose(e);
      throw Error(`Could not select value for select with name ${selectName}`);
    }
  }

  /**
   * Select value of a select index and  by the selects id
   * @param {string} selectId The id of the select
   * @param {number} index the index of the option you want to set
   * @returns {Promise} Promise object represents when the option has been
   * set to the element
   * @throws Will throw an error if the select is not found
   */
  async selectByIdAndIndex(selectId, index) {
    try {
      const script = `const select = document.getElementById('${selectId}'); select.selectedIndex = ${index};select.dispatchEvent(new Event('change'));`;
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (e) {
      log.error(
        'Could not select value for select with id %s by index',
        selectId
      );
      log.verbose(e);
      throw Error(`Could not select value for select with id ${selectId}`);
    }
  }

  /**
   * Select value of a select index and by the selects name
   * @param {string} selectName - the name of the select
   * @param {number} index - the index of the option you want to set
   * @returns {Promise} Promise object represents when the option has been
   * set to the element
   * @throws Will throw an error if the select is not found
   */
  async selectByNameAndIndex(selectName, index) {
    try {
      const script = `const select = document.querySelector("select[name='${selectName}']"); select.selectedIndex = ${index};select.dispatchEvent(new Event('change'));`;
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (e) {
      log.error(
        'Could not select value for select with name %s by index',
        selectName
      );
      log.verbose(e);
      throw Error(`Could not select value for select name ${selectName}`);
    }
  }

  /**
   * Deselect all options in a select.
   * @param {string} selectId
   * @returns {Promise} Promise object represents when options been deselected
   * @throws Will throw an error if the select is not found
   */
  async deselectById(selectId) {
    try {
      const script = `const select = document.getElementById('${selectId}'); select.selectedIndex = -1;select.dispatchEvent(new Event('change'));`;
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (e) {
      log.error('Could not deleselect by select id %s', selectId);
      log.verbose(e);
      throw Error(`Could not deleselect by select id  ${selectId}`);
    }
  }

  /**
   * Get all option values in a select.
   * @param {string} selectId - the id of the select.
   * @returns {Promise} Promise object tha will return an array with the values of the select
   * @throws Will throw an error if the select is not found
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
    } catch (e) {
      log.error('Could not get select options for id %s', selectId);
      log.verbose(e);
      throw Error(`Could not get select options for id ${selectId}`);
    }
  }

  /**
   * Get the selected option value in a select.
   * @param {select} selectId the id of the select.
   * @returns {Promise} Promise object tha will return the value of the selected option.
   * @throws Will throw an error if the select is not found.
   */
  async getSelectedValueById(selectId) {
    try {
      const script = `const select = document.getElementById('${selectId}'); return select.options[select.selectedIndex].value;`;
      const value = await this.browser.runScript(script, 'CUSTOM');
      return value;
    } catch (e) {
      log.error('Could not select value for select with id %s', selectId);
      log.verbose(e);
      throw Error(`Could not select value for select with id ${selectId}`);
    }
  }
}
module.exports = Select;
