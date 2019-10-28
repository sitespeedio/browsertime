'use strict';

const log = require('intel').getLogger('browsertime');
const merge = require('lodash.merge');
const { Condition } = require('selenium-webdriver/lib/webdriver');
const { isAndroidConfigured } = require('../android');
const { UrlLoadError, BrowserError } = require('../support/errors');
const builder = require('./webdriver');
const getViewPort = require('../support/getViewPort');

const defaultPageCompleteCheck = require('./defaultPageCompleteCheck');
const pageCompleteCheckByInactivity = require('./pageCompleteCheckByInactivity');
const spaCheck = require('./spaInactivity');

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
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Timeout a promise after ms. Use promise.race to compete
 * about the timeout and the promise.
 * @param {promise} promise - The promise to wait for
 * @param {int} ms - how long in ms to wait for the promise to fininsh
 * @param {string} errorMessage - the error message in the Error if we timeouts
 */
async function timeout(promise, ms, errorMessage) {
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
  constructor(baseDir, options) {
    this.options = merge({}, defaults, options);
    this.baseDir = baseDir;
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
          builder.createWebDriver(this.baseDir, this.options),
          this.options.timeouts.browserStart,
          `Failed to start browser in ${this.options.timeouts.browserStart /
            1000} seconds.`
        );
        break;
      } catch (e) {
        log.info(
          `Browser failed to start, trying ${tries - i - 1} more time(s): ${
            e.message
          }`
        );
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

      let viewPort = getViewPort(this.options);
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
          // Android do not support set position nor set size
          if (
            // Hack for Wallmart labs
            !this.options.android &&
            !isAndroidConfigured(this.options)
          ) {
            await window.setRect({
              width: Number(viewPort[0]),
              height: Number(viewPort[1]),
              x: 0,
              y: 0
            });
          }
        }
      }
    } catch (e) {
      throw new BrowserError(e.message, {
        cause: e
      });
    }
  }

  async extraWait(pageCompleteCheck) {
    await delay(1000);
    return this.wait(pageCompleteCheck);
  }
  /**
   * Wait for pageCompleteCheck to end before we return.
   * @param {string} pageCompleteCheck - JavaScript that checks if the page has finished loading
   * @throws {UrlLoadError}
   */
  async wait(pageCompleteCheck) {
    const waitTime = this.options.pageCompleteWaitTime || 5000;
    if (!pageCompleteCheck) {
      pageCompleteCheck = this.options.pageCompleteCheckInactivity
        ? pageCompleteCheckByInactivity
        : defaultPageCompleteCheck;
      // if using SPA just override
      if (this.options.spa) {
        pageCompleteCheck = spaCheck;
      }
    }

    const driver = this.driver,
      pageCompleteCheckTimeout = this.options.timeouts.pageCompleteCheck;
    try {
      const pageCompleteCheckCondition = new Condition(
        'for page complete check script to return true',
        function(d) {
          return d.executeScript(pageCompleteCheck, waitTime).then(function(t) {
            return t === true;
          });
        }
      );
      log.debug(
        `Waiting for script pageCompleteCheck at most ${pageCompleteCheckTimeout} ms`
      );
      log.verbose(`Waiting for script ${pageCompleteCheck}`);

      await timeout(
        driver.wait(pageCompleteCheckCondition, pageCompleteCheckTimeout),
        pageCompleteCheckTimeout,
        `Running page complete check ${pageCompleteCheck} took too long `
      );
    } catch (e) {
      log.error('Failed to wait ' + e);
      throw new UrlLoadError('Failed to wait ', {
        cause: e
      });
    }
  }

  /*
  async sendAndGetDevToolsCommand(cmd, params = {}) {
    return this.driver.sendAndGetDevToolsCommand(cmd, params);
  }
  async sendDevToolsCommand(cmd, params = {}) {
    return this.driver.sendDevToolsCommand(cmd, params);
  }
  */
  /**
   * Load and and wait for pageCompleteCheck to end before we return.
   * @param {string} url -The URL that will be tested.
   * @param {string} pageCompleteCheck - JavaScript that checks if the page has finished loading
   * @throws {UrlLoadError}
   */
  async loadAndWait(url, pageCompleteCheck) {
    const driver = this.driver;
    try {
      // To learn more about the event loop and request animation frame
      // watch Jake Archibald on ‘The Event Loop’ https://vimeo.com/254947206
      // TODO do we only want to do this when we record a video?
      const navigate = `(function() {
          const orange = document.getElementById('browsertime-orange');
          if (orange) {
            orange.parentNode.removeChild(orange);
          }
          window.requestAnimationFrame(function(){
            window.requestAnimationFrame(function(){
              window.location="${url}";
            });
          });
        })();`;

      const startUri = await driver.executeScript(
        'return document.documentURI;'
      );
      await driver.executeScript(navigate);
      // Wait max 50s on navigation
      for (let i = 0; i < 100; i++) {
        await delay(500);
        const newUri = await driver.executeScript(
          'return document.documentURI;'
        );
        // When the URI changed or of we are on the same page
        // see https://github.com/sitespeedio/browsertime/pull/623
        if (startUri != newUri || url === newUri) {
          break;
        }
      }
      await this.wait(pageCompleteCheck);
    } catch (e) {
      log.error('Could not load URL' + e);
      throw new UrlLoadError('Failed to load ' + url, url, {
        cause: e
      });
    }
    // E.g. when loading about:blank for the info page
    if (url.match(/^http(s)?:\/\//i)) {
      const uri = await driver.executeScript('return document.documentURI;');
      // Verify that the page succesfully loaded
      if (!uri.match(/^http(s)?:\/\//i)) {
        throw new UrlLoadError(
          'Failed to load/verify ' + url + ' uri:' + uri,
          url
        );
      }
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
      return timeout(
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
   * Run synchronous privileged JavaScript with args.
   * @param {string} script - the actual script
   * @param {string} name - the name of the script (for logging)
   * @param {*} args - arguments to the script
   * @throws {BrowserError}
   */
  async runPrivilegedScript(script, name, args) {
    if (this.options.browser !== 'firefox') {
      throw new BrowserError(
        `Only Firefox browsers can run privileged JavaScript: ${this.options.browser}`,
        { cause: 'PrivilegeError' }
      );
    }

    let scriptTimeout = this.options.timeouts.script;

    if (log.isEnabledFor(log.TRACE)) {
      log.verbose('Executing privileged script %s', script);
    } else if (log.isEnabledFor(log.VERBOSE)) {
      log.verbose('Executing privileged script %s', name);
    }

    try {
      const oldContext = this.driver.getContext();

      try {
        await this.driver.setContext('chrome');

        return timeout(
          this.driver.executeScript(script, args),
          scriptTimeout,
          `Running privileged script ${script} took too long (${scriptTimeout} ms).`
        );
      } finally {
        await this.driver.setContext(oldContext);
      }
    } catch (e) {
      log.error(
        "Couldn't execute privileged script named " + name + ' error:' + e
      );
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
      return this.driver.executeAsyncScript(script, args);
    } catch (e) {
      log.error("Couldn't execute async script named " + name + ' error:' + e);
      throw e;
    }
  }

  /**
   * Run asynchronous privileged JavaScript with args.
   * @param {string} script - the actual script
   * @param {string} name - the name of the script (for logging)
   * @param {*} args - arguments to the script
   * @throws {BrowserError}
   */
  async runPrivilegedAsyncScript(script, name, args) {
    if (this.options.browser !== 'firefox') {
      throw new BrowserError(
        `Only Firefox browsers can run privileged JavaScript: ${this.options.browser}`,
        { cause: 'PrivilegeError' }
      );
    }

    if (log.isEnabledFor(log.TRACE)) {
      log.verbose('Executing privileged async script %s', script);
    } else if (log.isEnabledFor(log.VERBOSE)) {
      log.verbose('Executing privileged async script %s', name);
    }

    try {
      const oldContext = this.driver.getContext();

      try {
        await this.driver.setContext('chrome');

        try {
          return this.driver.executeAsyncScript(script, args);
        } catch (e) {
          log.error(
            "Couldn't execute async script named " + name + ' error:' + e
          );
          throw e;
        }
      } finally {
        await this.driver.setContext(oldContext);
      }
    } catch (ce) {
      log.error("Couldn't execute async script named " + name + ' error:' + ce);
      throw ce;
    }
  }

  /**
   * Get logs from the browser.
   * @param {*} logType
   * @throws {BrowserError}
   */
  async getLogs(logType) {
    return timeout(
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
      try {
        await this.driver.quit();
        log.debug('Closed the browser.');
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
            const callback = arguments[arguments.length - 1];
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
      if (this.options.scriptInput && this.options.scriptInput[name]) {
        return this.runScript(source, name, this.options.scriptInput[name]);
      } else {
        return this.runScript(source, name);
      }
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
      try {
        const script = category[scriptName];
        const result = await this.runScriptFromCategory(
          script,
          isAsync,
          scriptName
        );
        if (!(result === null || result === undefined)) {
          results[scriptName] = result;
        }
      } catch (e) {
        log.error('Could not run script ' + scriptName + ':' + e.message);
      }
    }
    return results;
  }
}

module.exports = SeleniumRunner;
