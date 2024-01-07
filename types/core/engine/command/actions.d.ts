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
    constructor(browser: any);
    /**
     * @private
     */
    private driver;
    /**
     * @private
     */
    private actions;
    clear(): Promise<any>;
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
    getActions(): SeleniumActions;
}
import { Actions as SeleniumActions } from 'selenium-webdriver/lib/input.js';
//# sourceMappingURL=actions.d.ts.map