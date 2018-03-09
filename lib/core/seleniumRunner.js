'use strict';

const Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  webdriver = require('selenium-webdriver'),
  Condition = require('selenium-webdriver/lib/webdriver').Condition,
  WebDriverError = webdriver.error.WebDriverError,
  encodeError = webdriver.error.encodeError,
  builder = require('./webdriver'),
  UrlLoadError = require('../support/errors').UrlLoadError,
  BrowserError = require('../support/errors').BrowserError;

const defaultPageCompleteCheck = require('./pageCompleteCheck');

const defaults = {
  timeouts: {
    browserStart: 60000,
    pageLoad: 300000,
    script: 80000,
    logs: 90000,
    pageCompleteCheck: 300000
  },
  index: 0
};

/**
 * Timeout a promise after ms. Use promise.race to compete
 * about the timeout and the promise.
 * @param {promise} promise - The promise to wait for
 * @param {int} ms - how long in ms to wait for the promise to fininsh
 * @param {string} errorMessage - the error message in the Error if we timeouts
 */
function timeout(promise, ms, errorMessage) {
  let timer = null;

  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(reject, ms, new BrowserError(errorMessage));
      return timer;
    }),
    promise.then(value => {
      clearTimeout(timer);
      return value;
    })
  ]);
}

/**
 * Wrapper for Selenium.
 * @class
 */
class SeleniumRunner {
  constructor(options) {
    this.options = merge({}, defaults, options);
  }

  /**
   * Start the browser. Will timout after
   * --timeouts.browserStart time. It will try to start the
   * browser 3 times.
   * @throws {BrowserError} if the browser can't start
   */
  async start() {
    const tries = 3;
    for (let i = 0; i < tries; ++i) {
      try {
        this.driver = await timeout(
          builder.createWebDriver(this.options),
          this.options.timeouts.browserStart,
          `Failed to start browser in ${this.options.timeouts.browserStart /
            1000} seconds.`
        );
        break;
      } catch (e) {
        log.info(`Browser failed to start, trying one more time: ${e.message}`);
      }
    }
    if (!this.driver) {
      throw new BrowserError(`Could not start the browser with ${tries} tries`);
    }

    try {
      await this.driver.manage().setTimeouts({
        script: this.options.timeouts.script,
        pageLoad: this.options.timeouts.pageLoad
      });

      let viewPort = this.options.viewPort;
      if (viewPort) {
        if (viewPort !== 'maximize') {
          viewPort = viewPort.split('x');
        }
        const window = this.driver.manage().window();

        if (viewPort === 'maximize') {
          if (this.options.xvfb) {
            log.info(
              'Maximizing window in XVFB may not work, make sure that you verify that it works.'
            );
          }
          await window.maximize();
        } else {
          await window.setPosition(0, 0);
          await window.setSize(Number(viewPort[0]), Number(viewPort[1]));
        }
      }
    } catch (e) {
      throw new BrowserError(e.message, {
        cause: e
      });
    }
  }

  /**
   * Load and and wait for pageCompleteCheck to end before we return.
   * @param {string} url -The URL that will be tested.
   * @param {string} pageCompleteCheck - JavaScript that checks if the page has finished loading
   * @throws {UrlLoadError}
   */
  async loadAndWait(url, pageCompleteCheck = defaultPageCompleteCheck) {
    let driver = this.driver,
      pageCompleteCheckTimeout = this.options.timeouts.pageCompleteCheck;

    try {
      await driver.get(url);

      // E.g. when loading about:blank for the info page.s
      if (url.match(/^http(s)?:\/\//i)) {
        const uri = await driver.executeScript('return document.documentURI;');
        // Verify that the page succesfully loaded
        if (!uri.match(/^http(s)?:\/\//i)) {
          throw new UrlLoadError('Failed to load ' + url, url);
        }
      }

      const pageCompleteCheckCondition = new Condition(
        'for page complete check script to return true',
        function(d) {
          return d.executeScript(pageCompleteCheck).then(function(t) {
            return t === true;
          });
        }
      );

      log.debug(
        `Waiting for script ${pageCompleteCheck} at most ${pageCompleteCheckTimeout} ms`
      );
      const tries = 2;
      for (let i = 0; i < tries; ++i) {
        try {
          await timeout(
            driver.wait(pageCompleteCheckCondition, pageCompleteCheckTimeout),
            pageCompleteCheckTimeout,
            `Running page complete check ${pageCompleteCheck} took too long`
          );
          break;
        } catch (e) {
          if (e instanceof WebDriverError) {
            log.info(
              'Catched a WebDriverError [' +
                e.message +
                ']. Try one more time. Cause: ' +
                encodeError(e).message
            );
            // Last run, throw the error
            if ((i = tries - 1)) {
              throw e;
            }
          } else throw e;
        }
      }
    } catch (e) {
      log.error('Could not load URL' + e);
      throw new UrlLoadError('Failed to load ' + url, url, {
        cause: e
      });
    }
  }
  /**
   * Take a screenshot.
   *  @throws {BrowserError}
   */
  async takeScreenshot() {
    try {
      const base64EncodedPng = await this.driver.takeScreenshot();
      if (typeof base64EncodedPng === 'string') {
        return Buffer.from(base64EncodedPng, 'base64');
      } else {
        // Sometimes for Chrome, driver.takeScreenshot seems to succeed,
        // but the result is not a string.
        throw new BrowserError(
          `Failed to take screenshot (type was ${typeof base64EncodedPng}`
        );
      }
    } catch (e) {
      throw new BrowserError('Failed to take screenshot', { cause: e });
    }
  }

  /**
   * Run a synchrously JavaScript with args.
   * @param {string} script - the actual script
   * @param {string} name - the name of the script (for logging)
   * @param {*} args - arguments to the script
   * @throws {BrowserError}
   */
  async runScript(script, name, args) {
    let scriptTimeout = this.options.timeouts.script;

    if (log.isEnabledFor(log.TRACE)) {
      log.verbose('Executing script %s', script);
    } else if (log.isEnabledFor(log.VERBOSE)) {
      log.verbose('Executing script %s', name);
    }

    try {
      return await timeout(
        this.driver.executeScript(script, args),
        scriptTimeout,
        `Running script ${script} took too long (${scriptTimeout} ms).`
      );
    } catch (e) {
      log.error("Couldn't execute script named " + name + ' error:' + e);
      throw e;
    }
  }

  /**
   * Run a asynchrously JavaScript.
   * @param {string} script - the actual script
   * @param {string} name - the name of the script (for logging)
   * @param {*} args - arguments to the script
   * @throws {BrowserError}
   */
  async runAsyncScript(script, name, args) {
    if (log.isEnabledFor(log.TRACE)) {
      log.verbose('Executing async script %s', script);
    } else if (log.isEnabledFor(log.VERBOSE)) {
      log.verbose('Executing async script %s', name);
    }
    try {
      return await this.driver.executeAsyncScript(script, args);
    } catch (e) {
      log.error("Couldn't execute async script named " + name + ' error:' + e);
      throw e;
    }
  }

  /**
   * Run script with driver.
   * @param {*} driverScript
   */
  runWithDriver(driverScript) {
    return driverScript(this.driver);
  }

  /**
   * Get logs from the browser.
   * @param {*} logType
   * @throws {BrowserError}
   */
  async getLogs(logType) {
    return await timeout(
      this.driver
        .manage()
        .logs()
        .get(logType),
      this.options.timeouts.logs,
      `Extracting logs from browser took more than ${this.options.timeouts
        .logs / 1000} seconds.`
    );
  }

  /**
   * Stop the driver/browser.
   * @throws {BrowserError}
   */
  async stop() {
    if (this.driver) {
      log.debug('Telling browser to quit.');
      try {
        await this.driver.quit();
      } catch (e) {
        throw new BrowserError(e.message, {
          cause: e
        });
      }
    }
  }

  /**
   *
   * Scripts should be valid statements or IIFEs '(function() {...})()' that can run
   * on their own in the browser console. Prepend with 'return' to return result of statement to Browsertime.
   * @param {*} script - the script
   * @param {boolean} isAsync - is the script synchrously or async?
   * @param {*} name - the name of the script
   */
  async runScriptFromCategory(script, isAsync, name) {
    // Scripts should be valid statements or IIFEs '(function() {...})()' that can run
    // on their own in the browser console. Prepend with 'return' to return result of statement to Browsertime.
    if (isAsync) {
      const source = `
            var callback = arguments[arguments.length - 1];
            return (${script})
              .then((r) => callback({'result': r}))
              .catch((e) => callback({'error': e}));
            `;

      const result = await this.runAsyncScript(source, name);
      if (result.error) {
        throw result.error;
      } else {
        return result.result;
      }
    } else {
      const source = 'return ' + script;
      return await this.runScript(source, name);
    }
  }

  /**
   * Get the driver from Selenium.
   */
  getDriver() {
    return this.driver;
  }

  /**
   * Run scripts by category.
   * @param {*} scriptsByCategory
   * @param {boolean} isAsync - is the script synchrously or async?
   */
  async runScripts(scriptsByCategory, isAsync) {
    const categoryNames = Object.keys(scriptsByCategory);
    const results = {};
    for (let categoryName of categoryNames) {
      const category = scriptsByCategory[categoryName];
      results[categoryName] = await this.runScriptInCategory(category, isAsync);
    }
    return results;
  }

  /**
   * Run scripts in category.
   * @param {*} category
   * @param {boolean} isAsync - is the script synchrously or async?
   */
  async runScriptInCategory(category, isAsync) {
    const scriptNames = Object.keys(category);
    const results = {};
    for (let scriptName of scriptNames) {
      const script = category[scriptName];
      const result = await this.runScriptFromCategory(
        script,
        isAsync,
        scriptName
      );
      if (!(result === null || result === undefined)) {
        results[scriptName] = result;
      }
    }
    return results;
  }
}

module.exports = SeleniumRunner;
