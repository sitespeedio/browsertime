import { getLogger } from '@sitespeed.io/log';
import merge from 'lodash.merge';
import { Condition } from 'selenium-webdriver';
import { isAndroidConfigured } from '../android/index.js';
import { UrlLoadError, BrowserError, TimeoutError } from '../support/errors.js';
import { createWebDriver } from './webdriver/index.js';
import { getViewPort } from '../support/getViewPort.js';
import { defaultPageCompleteCheck } from './pageCompleteChecks/defaultPageCompleteCheck.js';
import { pageCompleteCheckByInactivity } from './pageCompleteChecks/pageCompleteCheckByInactivity.js';
import { spaInactivity as spaCheck } from './pageCompleteChecks/spaInactivity.js';
import { getProperty } from '../support/util.js';
const log = getLogger('browsertime');

const defaults = {
  timeouts: {
    browserStart: 60_000,
    pageLoad: 300_000,
    script: 120_000,
    logs: 90_000,
    pageCompleteCheck: 60_000
  },
  index: 0
};
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * @function timeout
 * @description Wraps a promise with a timeout, rejecting the promise with a TimeoutError if it does not settle within the specified time.
 *
 * @param {Promise} promise - The promise to wrap with a timeout.
 * @param {number} ms - The number of milliseconds to wait before timing out.
 * @param {string} errorMessage - The error message for the TimeoutError.
 *
 * @returns {Promise} - A promise that resolves with the value of the input promise if it settles within time, or rejects with a TimeoutError otherwise.
 */
async function timeout(promise, ms, errorMessage) {
  let timerId;
  let finished = false;

  // Create a new promise that rejects after `ms` milliseconds.
  const timer = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      if (!finished) {
        // Reject with a TimeoutError if the input promise has not yet settled.
        reject(new Error(errorMessage));
      }
    }, ms);
  });

  try {
    // Race the input promise against the timer.
    const result = await Promise.race([promise, timer]);
    finished = true;
    clearTimeout(timerId);
    return result;
  } catch (error) {
    finished = true;
    clearTimeout(timerId);
    throw error;
  }
}

/**
 * Wrapper for Selenium.
 * @class
 */
export class SeleniumRunner {
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
    for (let index = 0; index < tries; ++index) {
      try {
        this.driver = await timeout(
          createWebDriver(this.baseDir, this.options),
          this.options.timeouts.browserStart,
          `Failed to start ${this.options.browser} in ${
            this.options.timeouts.browserStart / 1000
          } seconds.`
        );
        break;
      } catch (error) {
        log.info(
          `${this.options.browser} failed to start, trying ${
            tries - index - 1
          } more time(s): ${error.message}`
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
    } catch (error) {
      throw new BrowserError(error.message, {
        cause: error
      });
    }
  }

  async extraWait(pageCompleteCheck) {
    await delay(this.options.beforePageCompleteWaitTime || 5000);
    return this._waitOnPageCompleteCheck(pageCompleteCheck);
  }
  /**
   * Wait for pageCompleteCheck to end before we return.
   * @param {string} pageCompleteCheck - JavaScript that checks if the page has finished loading
   * @throws {UrlLoadError}
   */

  async _waitOnPageCompleteCheck(pageCompleteCheck, url) {
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
        function (d) {
          return d
            .executeScript(pageCompleteCheck, waitTime)
            .then(function (t) {
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
    } catch (error) {
      if (error instanceof TimeoutError) {
        log.info(
          `The page did not finished loading in ${pageCompleteCheckTimeout} ms. You can adjust the timeout by setting the --maxLoadTime option (in ms).`
        );
      } else {
        log.error(
          `Failed waiting on page ${
            url ?? ''
          } to finished loading, timed out after ${pageCompleteCheckTimeout} ms`,
          error
        );
        throw new UrlLoadError(
          `Failed waiting on page ${
            url ?? ''
          }  to finished loading, timed out after ${pageCompleteCheckTimeout} ms `,
          {
            cause: error
          }
        );
      }
    }
  }

  /**
   * Load and and wait for pageCompleteCheck to end before we return.
   * @param {string} url -The URL that will be tested.
   * @param {string} pageCompleteCheck - JavaScript that checks if the page has finished loading
   * @throws {UrlLoadError}
   */
  async loadAndWait(url, pageCompleteCheck, engine) {
    const driver = this.driver;
    // Browsers may normalize 'https://x.com' differently; in particular, Firefox normalizes to
    // 'https://x.com/'.  This is a first normalization attempt; there are deeper options that order
    // query parameters, order fragments, etc.  We don't want to change url itself 'cuz it can be
    // used for indexing collected data and it is possible that normalization could change a key.
    const normalizedURI = new URL(url).toString();

    // See  https://github.com/sitespeedio/browsertime/issues/1698
    const retries = 5;
    let documentURI;
    for (var index = 0; index < retries; index++) {
      documentURI = await driver.executeScript('return document.documentURI;');
      if (documentURI != undefined) {
        break;
      }
      await delay(1000);
    }
    let startURI;
    try {
      startURI = new URL(documentURI).toString();
    } catch (error) {
      log.error(`Failed to get documentURI ${documentURI}`, error);
    }
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

    if (this.options.pageCompleteCheckNetworkIdle) {
      return engine.waitForNetworkIdle(driver);
    } else {
      // If you run with default settings, the webdriver will give back
      // control ASAP. Therefore you want to wait some extra time
      // before you start to run your page complete check
      this.options.pageLoadStrategy === 'none'
        ? await delay(this.options.pageCompleteCheckStartWait || 5000)
        : await delay(2000);

      // We give it a couple of times to finish loading, this makes it
      // more stable in real case scenarios on slow servers.
      let totalWaitTime = 0;
      const tries = getProperty(this.options, 'retries', 5) + 1;
      for (let index = 0; index < tries; ++index) {
        try {
          await this._waitOnPageCompleteCheck(pageCompleteCheck, normalizedURI);
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
          } else if (newURI === startURI) {
            const waitTime =
              (this.options.retryWaitTime || 10_000) * (index + 1);
            totalWaitTime += waitTime;
            log.debug(
              `URL ${url} failed to load, the ${
                this.options.browser
              } are still on ${startURI} , trying ${
                tries - index - 1
              } more time(s) but first wait for ${waitTime} ms.`
            );

            if (index === tries - 1) {
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
          } else {
            // We navigated to a new page, we don't need to test anymore
            break;
          }
        } catch (error) {
          log.info(
            `URL failed to load, trying ${tries - index - 1} more time(s): ${
              error.message
            }`
          );
          //
          if (index === tries - 1) {
            // If the last tries through an error, rethrow as before
            log.error('Could not load URL %s', url, error);
            throw new UrlLoadError('Failed to load ' + url, url, {
              cause: error
            });
          } else {
            await delay(1000);
          }
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
    } catch (error) {
      log.error(
        'Failed to take screenshot' + (url ? ' for ' + url : ''),
        error
      );
      throw new BrowserError('Failed to take screenshot', { cause: error });
    }
  }

  /**
   * Run a synchrously JavaScript with args.
   * @param {string} script - the actual script
   * @param {string} name - the name of the script (for logging)
   * @param {*} args - arguments to the script
   * @throws {BrowserError}
   */
  async runScript(script, name, arguments_) {
    let scriptTimeout = this.options.timeouts.script;

    log.verbose('Executing script %s', script);
    log.verbose('Executing script %s', name);

    try {
      const result = await timeout(
        this.driver.executeScript(script, arguments_),
        scriptTimeout,
        `Running script ${script} took too long (${scriptTimeout} ms).`
      );
      return result;
    } catch (error) {
      log.error("Couldn't execute script named " + name + ' error:' + error);
      throw error;
    }
  }

  /**
   * Run synchronous privileged JavaScript with args.
   * @param {string} script - the actual script
   * @param {string} name - the name of the script (for logging)
   * @param {*} args - arguments to the script
   * @throws {BrowserError}
   */
  async runPrivilegedScript(script, name, arguments_) {
    if (this.options.browser !== 'firefox') {
      throw new BrowserError(
        `Only Firefox browsers can run privileged JavaScript: ${this.options.browser}`,
        { cause: 'PrivilegeError' }
      );
    }

    log.verbose('Executing privileged script %s', script);
    log.verbose('Executing privileged script %s', name);

    const oldContext = await this.driver.getContext();

    try {
      await this.driver.setContext('chrome');
      const result = await this.driver.executeScript(script, arguments_);
      await this.driver.setContext(oldContext);
      return result;
    } catch (error) {
      log.error(
        "Couldn't execute privileged script named " + name + ' error:' + error
      );
      await this.driver.setContext(oldContext);
      throw error;
    }
  }

  /**
   * Run a asynchrously JavaScript.
   * @param {string} script - the actual script
   * @param {string} name - the name of the script (for logging)
   * @param {*} args - arguments to the script
   * @throws {BrowserError}
   */
  async runAsyncScript(script, name, arguments_) {
    log.verbose('Executing async script %s', script);

    log.verbose('Executing async script %s', name);

    return this.driver.executeAsyncScript(script, arguments_);
  }

  /**
   * Run asynchronous privileged JavaScript with args.
   * @param {string} script - the actual script
   * @param {string} name - the name of the script (for logging)
   * @param {*} args - arguments to the script
   * @throws {BrowserError}
   */
  async runPrivilegedAsyncScript(script, name, arguments_) {
    if (this.options.browser !== 'firefox') {
      throw new BrowserError(
        `Only Firefox browsers can run privileged JavaScript: ${this.options.browser}`,
        { cause: 'PrivilegeError' }
      );
    }

    log.verbose('Executing privileged async script %s', script);
    log.verbose('Executing privileged async script %s', name);

    try {
      const oldContext = await this.driver.getContext();
      await this.driver.setContext('chrome');
      const result = await this.driver.executeAsyncScript(script, arguments_);
      await this.driver.setContext(oldContext);
      return result;
    } catch (error) {
      log.error(
        "Couldn't execute async script named " + name + ' error:' + error
      );
      throw error;
    }
  }

  /**
   * Get logs from the browser.
   * @param {*} logType
   * @throws {BrowserError}
   */
  async getLogs(logType) {
    return timeout(
      this.driver.manage().logs().get(logType),
      this.options.timeouts.logs,
      `Extracting logs from ${this.options.browser} took more than ${
        this.options.timeouts.logs / 1000
      } seconds.`
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
          120_000,
          'Could not close the browser using driver.quit'
        );
      } catch (error) {
        throw new BrowserError(error.message, {
          cause: error
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
      scriptRunner = privilegeWanted
        ? this.runPrivilegedAsyncScript.bind(this)
        : this.runAsyncScript.bind(this);
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
      return this.options.scriptInput && this.options.scriptInput[name]
        ? scriptRunner(source, name, this.options.scriptInput[name])
        : scriptRunner(source, name);
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
      } catch (error) {
        if (error.extra && error.extra.cause === 'PrivilegeError') {
          // Ignore those scripts that fail to execute because they
          // wanted privileges that the browser cannot provide.
          log.verbose(
            'Did not have enough privileges to execute user script: ' +
              error +
              '; ignoring.'
          );
        } else {
          log.error('Failed to execute user script: ' + error);
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
    let requires;

    for (let scriptName of scriptNames) {
      let isAsyncOverride = false;
      requires = {};
      let script = category[scriptName];

      if (typeof script != 'string') {
        script = script.content;
      }

      // Assume that if the string in content is null
      // the function is not null and we want to run
      // the function.
      if (!script) {
        let function_ = category[scriptName].function;
        if (!function_) {
          throw (
            'Function and script cannot both be null in ' + scriptName + '.'
          );
        }
        // We wrap the source code of the function in parenthesis
        // "(...)" to contain it in a separate scope. We add a
        // "();" to the source of the function to do the actual
        // invocation. The script writer cannot do this in their
        // source because it would force the evaluation of the
        // function too soon and cause undefined reference errors.
        script = '( ' + function_ + ' )()';
        requires = category[scriptName].requires;
        isAsyncOverride = category[scriptName].isAsync;
      }
      if (
        Object.keys(requires).length > 0 &&
        this.options.browser !== 'firefox'
      ) {
        // Require is only for running in Firefox
      } else {
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
    }
    return results;
  }
}
