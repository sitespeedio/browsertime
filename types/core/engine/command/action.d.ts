/**
 * This class provides an abstraction layer for Selenium's action sequence functionality.
 * It allows for easy interaction with web elements using different locating strategies
 * and simulating complex user gestures like mouse movements, key presses, etc.
 *
 * @class
 * @hideconstructor
 * @see https://www.selenium.dev/documentation/webdriver/actions_api/
 */
export class Action {
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
    getAction(): SeleniumActions;
    /**
     * Finds an element by its CSS selector.
     *
     * @param {string} name - The CSS selector of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getElementByCss(name: string): Promise<WebElement>;
    /**
     * Finds an element by its ID.
     *
     * @param {string} id - The ID of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getElementById(id: string): Promise<WebElement>;
    /**
     * Finds an element by its XPath.
     *
     * @param {string} xpath - The XPath query of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getElementByXpath(xpath: string): Promise<WebElement>;
    /**
     * Finds an element by its class name.
     *
     * @param {string} className - The class name of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getElementByClassName(className: string): Promise<WebElement>;
    /**
     * Finds an element by its name attribute.
     *
     * @param {string} name - The name attribute of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getElementByName(name: string): Promise<WebElement>;
}
import { Actions as SeleniumActions } from 'selenium-webdriver';
import { WebElement } from 'selenium-webdriver';
//# sourceMappingURL=action.d.ts.map