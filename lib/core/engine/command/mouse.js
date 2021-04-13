'use strict';

const log = require('intel').getLogger('browsertime.command.mouse');
const webdriver = require('selenium-webdriver');

class ClickAndHold {
  constructor(browser) {
    this.driver = browser.getDriver();
    this.actions = this.driver.actions({ async: true });
  }

  /**
   * Click and hold an element that matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when mouse is pressed.
   * @throws Will throw an error if the element is not found.
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(webdriver.By.xpath(xpath));
      return this.actions
        .move({ origin: element })
        .press()
        .perform();
    } catch (e) {
      log.error('Could not click and hold on element with xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not click and hold on element with xpath ' + xpath);
    }
  }

  /**
   * Click and hold an element at the cursor's position.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when mouse is pressed.
   * @throws Will throw an error if action cannot be performed.
   */
  async atCursor() {
    try {
      return this.actions
        .move({ origin: webdriver.Origin.POINTER })
        .press()
        .perform();
    } catch (e) {
      log.error('Could not click and hold at cursor');
      log.verbose(e);
      throw Error('Could not click and hold at cursor');
    }
  }

  /**
   * Click and hold an element at the given coordinates.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when mouse is pressed.
   * @throws Will throw an error if action cannot be performed.
   */
  async atPosition(xPos, yPos) {
    try {
      return this.actions
        .move({ x: xPos, y: yPos, origin: webdriver.Origin.VIEWPORT })
        .press()
        .perform();
    } catch (e) {
      log.error('Could not click and hold at position (%d,%d)', xPos, yPos);
      log.verbose(e);
      throw Error(
        'Could not click and hold at position (' + xPos + ',' + yPos + ')'
      );
    }
  }

  /**
   * Release mouse on element that matches the specified Xpath.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when mouse is released.
   * @throws Will throw an error if action cannot be performed.
   */
  async releaseAtXpath(xpath) {
    try {
      const element = await this.driver.findElement(webdriver.By.xpath(xpath));
      return this.actions
        .move({ origin: element })
        .release()
        .perform();
    } catch (e) {
      log.error('Could not release on xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not release on xpath ' + xpath);
    }
  }

  /**
   * Release mouse at specified coordinates.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when mouse is released.
   * @throws Will throw an error if action cannot be performed.
   */
  async releaseAtPosition(xPos, yPos) {
    try {
      return this.actions
        .move({ x: xPos, y: yPos, origin: webdriver.Origin.VIEWPORT })
        .release()
        .perform();
    } catch (e) {
      log.error('Could not release at position (%d,%d)', xPos, yPos);
      log.verbose(e);
      throw Error('Could not release at position (' + xPos + ',' + yPos + ')');
    }
  }
}

class SingleClick {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.actions = this.browser.getDriver().actions({ async: true });
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Perform mouse single click on an element matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when the element has been clicked.
   * @throws Will throw an error if the element is not found.
   */
  async byXpath(xpath, options) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.xpath(xpath));
      await this.actions.click(element).perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (e) {
      log.error('Could not single click on element with xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not single click on element with xpath ' + xpath);
    }
  }

  /**
   * Perform mouse single click at the cursor's position.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when double click occurs.
   * @throws Will throw an error if double click cannot be performed.
   */
  async atCursor(options) {
    try {
      await this.actions.click().perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (e) {
      log.error('Could not perform single click');
      log.verbose(e);
      throw Error('Could not perform single click');
    }
  }
}

class DoubleClick {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.actions = this.browser.getDriver().actions({ async: true });
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Perform mouse double click on an element matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when the element has been double clicked.
   * @throws Will throw an error if the element is not found.
   */
  async byXpath(xpath, options) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.xpath(xpath));
      await this.actions.doubleClick(element).perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (e) {
      log.error('Could not double click on element with xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not double click on element with xpath ' + xpath);
    }
  }

  /**
   * Perform mouse double click at the cursor's position.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when double click occurs.
   * @throws Will throw an error if double click cannot be performed.
   */
  async atCursor(options) {
    try {
      await this.actions.doubleClick().perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (e) {
      log.error('Could not perform double click');
      log.verbose(e);
      throw Error('Could not perform double click');
    }
  }
}

class ContextClick {
  constructor(browser) {
    this.driver = browser.getDriver();
    this.actions = this.driver.actions({ async: true });
  }

  /**
   * Perform ContextClick on an element that matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when context click occurs.
   * @throws Will throw an error if the element is not found
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(webdriver.By.xpath(xpath));
      return this.actions.contextClick(element).perform();
    } catch (e) {
      log.error('Could not context click on element with xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not context click on element with xpath ' + xpath);
    }
  }

  /**
   * Perform ContextClick at the cursor's position.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when context click occurs.
   * @throws Will throw an error if context click cannot be performed.
   */
  async atCursor() {
    try {
      return this.actions.contextClick().perform();
    } catch (e) {
      log.error('Could not perform context click');
      log.verbose(e);
      throw Error('Could not perform context click');
    }
  }
}

class MouseMove {
  constructor(browser) {
    this.driver = browser.getDriver();
    this.actions = this.driver.actions({ async: true });
  }

  /**
   * Move mouse to an element that matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when the mouse has moved
   * @throws Will throw an error if the element is not found
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(webdriver.By.xpath(xpath));
      return this.actions.move({ origin: element }).perform();
    } catch (e) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not find element by xpath ' + xpath);
    }
  }

  /**
   * Move mouse to a position
   * @param {number} xPos, {number} yPos
   * @returns {Promise} Promise object represents when the mouse has moved
   * @throws Will throw an error if the element is not found
   */
  async toPosition(xPos, yPos) {
    try {
      return this.actions.move({ x: xPos, y: yPos }).perform();
    } catch (e) {
      log.error('Could not move mouse to position.');
      log.verbose(e);
      throw Error('Could not move mouse to position.');
    }
  }

  /**
   * Move mouse by an offset
   * @param {number} xOffset, {number} yOffset
   * @returns {Promise} Promise object represents when the mouse has moved
   * @throws Will throw an error if the element is not found
   */
  async byOffset(xOffset, yOffset) {
    try {
      return this.actions
        .move({ x: xOffset, y: yOffset, origin: webdriver.Origin.POINTER })
        .perform();
    } catch (e) {
      log.error('Could not move mouse by offset');
      log.verbose(e);
      throw Error('Could not move mouse by offset');
    }
  }
}

module.exports = {
  SingleClick,
  DoubleClick,
  ClickAndHold,
  ContextClick,
  MouseMove
};
