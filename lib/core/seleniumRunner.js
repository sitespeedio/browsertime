'use strict';

const log = require('intel').getLogger('browsertime');
const merge = require('lodash.merge');
const get = require('lodash.get');
const { Condition } = require('selenium-webdriver/lib/webdriver');
const { isAndroidConfigured } = require('../android');
const { UrlLoadError, BrowserError } = require('../support/errors');
const builder = require('./webdriver');
const getViewPort = require('../support/getViewPort');
const defaultPageCompleteCheck = require('./pageCompleteChecks/defaultPageCompleteCheck');
const pageCompleteCheckByInactivity = require('./pageCompleteChecks/pageCompleteCheckByInactivity');
const spaCheck = require('./pageCompleteChecks/spaInactivity');

const defaults = {
  timeouts: {
    browserStart: 60000,
    pageLoad: 300000,
    script: 120000,
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
    this.browserRestartTries = this.options.browserRestartTries || 3;
  }

  /**
   * Start the browser. Will timout after
   * --timeouts.browserStart time. It will try to start the
   * browser X times.
   * @throws {BrowserError} if the browser can't start
   */
  async start() {
    const tries = this.browserRestartTries;
    for (let i = 0; i < tries; ++i) {
      try {
        this.driver = await timeout(
          builder.createWebDriver(this.baseDir, this.options),
          this.options.timeouts.browserStart,
          `Failed to start ${this.options.browser} in ${this.options.timeouts
            .browserStart / 1000} seconds.`
        );
        break;
      } catch (e) {
        log.info(
          `${this.options.browser} failed to start, trying ${tries -
            i -
            1} more time(s): ${e.message}`
        );
      }
    }
    if (!this.driver) {
      throw new BrowserError(
        `Could not start ${this.options.browser} with ${tries} tries`
      );
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
    await delay(2000);
    return this.wait(pageCompleteCheck);
  }
  /**
   * Wait for pageCompleteCheck to end before we return.
   * @param {string} pageCompleteCheck - JavaScript that checks if the page has finished loading
   * @throws {UrlLoadError}
   */
  async wait(pageCompleteCheck, url) {
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
            log.verbose('PageCompleteCheck returned %s', t);
            return t === true;
          });
        }
      );
      log.debug(
        `Waiting for script pageCompleteCheck at most ${pageCompleteCheckTimeout} ms`
      );
      log.verbose(`Waiting for script ${pageCompleteCheck}`);
      await timeout(
        driver.wait(
          pageCompleteCheckCondition,
          pageCompleteCheckTimeout,
          undefined,
          this.options.pageCompleteCheckPollTimeout || 1500
        ),
        pageCompleteCheckTimeout,
        `Running page complete check ${pageCompleteCheck} took too long`
      );
    } catch (e) {
      log.error(
        `Failed waiting on page ${
          url ? url : ''
        } to finished loading, timed out after ${pageCompleteCheckTimeout} ms`,
        e
      );
      throw new UrlLoadError(
        `Failed waiting on page ${
          url ? url : ''
        }  to finished loading, timed out after ${pageCompleteCheckTimeout} ms `,
        {
          cause: e
        }
      );
    }
  }

  /**
   * Load and and wait for pageCompleteCheck to end before we return.
   * @param {string} url -The URL that will be tested.
   * @param {string} pageCompleteCheck - JavaScript that checks if the page has finished loading
   * @throws {UrlLoadError}
   */
  async loadAndWait(url, pageCompleteCheck) {
    const driver = this.driver;
    // Browsers may normalize 'https://x.com' differently; in particular, Firefox normalizes to
    // 'https://x.com/'.  This is a first normalization attempt; there are deeper options that order
    // query parameters, order fragments, etc.  We don't want to change url itself 'cuz it can be
    // used for indexing collected data and it is possible that normalization could change a key.
    const normalizedURI = new URL(url).toString();
    const startURI = new URL(
      await driver.executeScript('return document.documentURI;')
    ).toString();
    if (this.options.webdriverPageload) {
      const clearOrange = `(function() {
        const orange = document.getElementById('browsertime-orange');
        if (orange) {
          orange.parentNode.removeChild(orange);
        }
        })();`;
      await driver.executeScript(clearOrange);
      log.debug('Using webdriver.get to navigate');
      await driver.get(url);
    } else {
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
      // Navigate to the page
      log.debug('Using window.location to navigate');
      await driver.executeScript(navigate);
    }

    // If you run with default settings, the webdriver will give back
    // control ASAP. Therefore you want to wait some extra time
    // before you start to run your page complete check
    if (this.options.pageLoadStrategy === 'none') {
      await delay(this.options.pageCompleteCheckStartWait || 5000);
    } else {
      // Give the browser some time to navigate
      await delay(2000);
    }

    // We give it a couple of times to finish loading, this makes it
    // more stable in real case scenarios on slow servers.
    let totalWaitTime = 0;
    const tries = get(this.options, 'retries', 5) + 1;
    for (let i = 0; i < tries; ++i) {
      try {
        await this.wait(pageCompleteCheck, normalizedURI);
        const newURI = new URL(
          await driver.executeScript('return document.documentURI;')
        ).toString();
        // If we use a SPA it could be that we don't test a new URL so just do one try
        // and make sure your page complete check take care of other things
        if (this.options.spa) {
          break;
        } else if (normalizedURI === startURI) {
          // You are navigating to the current page
          break;
        } else if (normalizedURI.startsWith('data:text')) {
          // Navigations between data/text seems to don't change the URI
          break;
        } else if (newURI === 'chrome-error://chromewebdata/') {
          // This is the timeout URL for Chrome, just continue to try
          throw new UrlLoadError(
            `Could not load ${url} is the web page down?`,
            url
          );
        } else if (newURI !== startURI) {
          // We navigated to a new page, we don't need to test anymore
          break;
        } else {
          const waitTime = (this.options.retryWaitTime || 10000) * (i + 1);
          totalWaitTime += waitTime;
          log.info(
            `URL ${url} failed to load, the ${
              this.options.browser
            } are still on ${startURI} , trying ${tries -
              i -
              1} more time(s) but first wait for ${waitTime} ms.`
          );

          if (i === tries - 1) {
            // If the last tries through an error, rethrow as before
            const message = `Could not load ${url} - the navigation never happend after ${tries} tries and total wait time of ${totalWaitTime} ms`;
            log.error(message);
            throw new UrlLoadError(message, url);
          } else {
            // We add some wait time before we try again
            await delay(waitTime);
            log.info(
              'Will check again if the browser has navigated to the page'
            );
          }
        }
      } catch (e) {
        log.info(
          `URL failed to load, trying ${tries - i - 1} more time(s): ${
            e.message
          }`
        );
        //
        if (i === tries - 1) {
          // If the last tries through an error, rethrow as before
          log.error('Could not load URL %s', url, e);
          throw new UrlLoadError('Failed to load ' + url, url, {
            cause: e
          });
        } else {
          await delay(1000);
        }
      }
    }
  }
  /**
   * Take a screenshot.
   *  @param {string} url -The URL that is tested for logging purposes
   *  @throws {BrowserError}
   */
  async takeScreenshot(url) {
    try {
      const base64EncodedPng = await this.driver.takeScreenshot();
      if (typeof base64EncodedPng === 'string') {
        return Buffer.from(base64EncodedPng, 'base64');
      } else {
        // Sometimes for Chrome, driver.takeScreenshot seems to succeed,
        // but the result is not a string.
        log.warning(
          `Failed to take screenshot (type was ${typeof base64EncodedPng}`
        );
        throw new BrowserError(
          `Failed to take screenshot (type was ${typeof base64EncodedPng}`
        );
      }
    } catch (e) {
      log.error('Failed to take screenshot' + (url ? ' for ' + url : ''), e);
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
      const result = await timeout(
        this.driver.executeScript(script, args),
        scriptTimeout,
        `Running script ${script} took too long (${scriptTimeout} ms).`
      );
      return result;
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

    log.trace('Executing privileged script %s', script);
    log.verbose('Executing privileged script %s', name);

    const oldContext = await this.driver.getContext();

    try {
      await this.driver.setContext('chrome');
      const result = await this.driver.executeScript(script, args);
      await this.driver.setContext(oldContext);
      return result;
    } catch (e) {
      log.error(
        "Couldn't execute privileged script named " + name + ' error:' + e
      );
      await this.driver.setContext(oldContext);
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
    return this.driver.executeAsyncScript(script, args);
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

    log.trace('Executing privileged async script %s', script);
    log.verbose('Executing privileged async script %s', name);

    try {
      const oldContext = await this.driver.getContext();
      await this.driver.setContext('chrome');
      const result = await this.driver.executeAsyncScript(script, args);
      await this.driver.setContext(oldContext);
      return result;
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
      `Extracting logs from ${this.options.browser} took more than ${this
        .options.timeouts.logs / 1000} seconds.`
    );
  }

  /**
   * Stop the driver/browser.
   * @throws {BrowserError}
   */
  async stop() {
    if (this.driver) {
      try {
        return timeout(
          this.driver.quit(),
          120000,
          'Could not close the browser using driver.quit'
        );
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
   * @param {[String]} requires - the requirements for executing the script
   */
  async runScriptFromCategory(script, isAsync, name, requires) {
    const privilegeWanted = requires && requires.privilege;
    let scriptRunner = this.runScript.bind(this);

    if (isAsync) {
      if (privilegeWanted) {
        scriptRunner = this.runPrivilegedAsyncScript.bind(this);
      } else {
        scriptRunner = this.runAsyncScript.bind(this);
      }
    } else {
      if (privilegeWanted) {
        scriptRunner = this.runPrivilegedScript.bind(this);
      }
    }

    if (privilegeWanted) {
      log.verbose('Executing script ' + name + ' with privilege.');
    }

    // Scripts should be valid statements or IIFEs '(function() {...})()' that can run
    // on their own in the browser console. Prepend with 'return' to return result of statement to Browsertime.
    if (isAsync) {
      const source = `
            const callback = arguments[arguments.length - 1];
            return (${script})
              .then((r) => callback({'result': r}))
              .catch((e) => callback({'error': e}));
            `;

      const result = await scriptRunner(source, name);
      if (result.error) {
        throw result.error;
      } else {
        return result.result;
      }
    } else {
      const source = 'return ' + script;
      if (this.options.scriptInput && this.options.scriptInput[name]) {
        return scriptRunner(source, name, this.options.scriptInput[name]);
      } else {
        return scriptRunner(source, name);
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
      try {
        results[categoryName] = await this.runScriptInCategory(
          category,
          isAsync
        );
      } catch (e) {
        if (e.extra && e.extra.cause === 'PrivilegeError') {
          // Ignore those scripts that fail to execute because they
          // wanted privileges that the browser cannot provide.
          log.verbose(
            'Did not have enough privileges to execute user script: ' +
              e +
              '; ignoring.'
          );
        } else {
          log.error('Failed to execute user script: ' + e);
          results[categoryName] = undefined;
        }
      }
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
    let requires = [];

    for (let scriptName of scriptNames) {
      let isAsyncOverride = false;
      let script = category[scriptName];

      if (typeof script != 'string') {
        script = script.content;
      }

      // Assume that if the string in content is null
      // the function is not null and we want to run
      // the function.
      if (!script) {
        let func = category[scriptName].function;
        if (!func) {
          throw 'Function and script cannot both be null in ' +
            scriptName +
            '.';
        }
        // We wrap the source code of the function in parenthesis
        // "(...)" to contain it in a separate scope. We add a
        // "();" to the source of the function to do the actual
        // invocation. The script writer cannot do this in their
        // source because it would force the evaluation of the
        // function too soon and cause undefined reference errors.
        script = '( ' + func + ' )()';
        requires = category[scriptName].requires;
        isAsyncOverride = category[scriptName].isAsync;
      }

      const result = await this.runScriptFromCategory(
        script,
        isAsync || isAsyncOverride,
        scriptName,
        requires
      );
      if (!(result === null || result === undefined)) {
        results[scriptName] = result;
      }
    }
    return results;
  }
}

module.exports = SeleniumRunner;
