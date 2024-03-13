// We disable these because they are needed for code completion
/* eslint no-unused-vars: "off" */
import { Actions as SeleniumActions } from 'selenium-webdriver/lib/input.js';
/**
 * This class provides an abstraction layer for Selenium's action sequence functionality.
 * It allows for easy interaction with web elements using different locating strategies
 * and simulating complex user gestures like mouse movements, key presses, etc.
 *
 * @class
 * @hideconstructor
 * @see https://www.selenium.dev/documentation/webdriver/actions_api/
 * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/input_exports_Actions.html
 */
export class Actions {
  constructor(browser) {
    /**
     * @private
     */
    this.driver = browser.getDriver();
    /**
     * @private
     */
    this.actions = this.driver.actions({ async: true });
  }

  /*
   * Clears the stored actions. You need to manually clear actions, before you start a new action.
   *
   * @returns {Promise<void>} A promise that will be resolved when the actions have been
   *  cleared.
   */
  async clear() {
    return this.actions.clear();
  }

  /**
   * Retrieves the current action sequence builder.
   * The actions builder can be used to chain multiple browser actions.
   * @returns {SeleniumActions} The current Selenium Actions builder object for chaining browser actions.
   *  @example
   * // Example of using the actions builder to perform a drag-and-drop operation:
   * const elementToDrag = await commands.action.getElementByCss('.draggable');
   * const dropTarget = await commands.action.getElementByCss('.drop-target');
   * await commands.action.getAction()
   *   .dragAndDrop(elementToDrag, dropTarget)
   *   .perform();
   *
   */
  getActions() {
    return this.actions;
  }
}
