'use strict';

const util = require('util'),
  Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  webdriver = require('selenium-webdriver'),
  Condition = require('selenium-webdriver/lib/webdriver').Condition,
  WebDriverError = webdriver.error.WebDriverError,
  encodeError = webdriver.error.encodeError,
  builder = require('./webdriver'),
  UrlLoadError = require('../support/errors').UrlLoadError,
  BrowserError = require('../support/errors').BrowserError;

const defaultPageCompleteCheck =
  'return (function() {try { var end = window.performance.timing.loadEventEnd;' +
  'return (end > 0) && (Date.now() > end + 2000);} catch(e) {return true;}})()';
const defaults = {
  timeouts: {
    browserStart: 60000,
    pageLoad: 300000,
    script: 80000,
    pageCompleteCheck: 300000
  },
  index: 0
};

class SeleniumRunner {
  constructor(options) {
    this.options = merge({}, defaults, options);
  }

  start() {
    function startBrowser() {
      return Promise.try(() =>
        builder.createWebDriver(this.options).tap(driver => {
          this.driver = driver;
        })
      ).timeout(
        this.options.timeouts.browserStart,
        util.format(
          'Failed to start browser in %d seconds.',
          this.options.timeouts.browserStart / 1000
        )
      );
    }

    return startBrowser
      .call(this)
      .catch(e => {
        log.info(`Browser failed to start, trying one more time: ${e.message}`);
        return startBrowser.call(this).catch(e => {
          throw new BrowserError(e.message, {
            cause: e
          });
        });
      })
      .tap(() => {
        return this.driver.manage().setTimeouts({
          script: this.options.timeouts.script,
          pageLoad: this.options.timeouts.pageLoad
        });
      })
      .tap(() => {
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
            return window.maximize();
          } else {
            return window
              .setPosition(0, 0)
              .then(() =>
                window.setSize(Number(viewPort[0]), Number(viewPort[1]))
              );
          }
        }
      })
      .catch(BrowserError, e => {
        throw e;
      })
      .catch(e => {
        throw new BrowserError(e.message, {
          cause: e
        });
      });
  }

  loadAndWait(url, pageCompleteCheck = defaultPageCompleteCheck) {
    let driver = this.driver,
      pageCompleteCheckTimeout = this.options.timeouts.pageCompleteCheck;

    function getUrl() {
      return Promise.try(function() {
        log.debug('Requesting url %s', url);
        return driver.get(url);
      });
    }

    function confirmUrlSuccessfullyLoaded() {
      if (!url.match(/^http(s)?:\/\//i)) {
        // E.g. when loading about:blank for the info page.
        return Promise.resolve();
      }

      return Promise.resolve(
        driver.executeScript('return document.documentURI;')
      ).then(uri => {
        if (!uri.match(/^http(s)?:\/\//i))
          throw new UrlLoadError('Failed to load ' + url, url);
      });
    }

    function waitForPageCompletion() {
      let pageCompleteCheckCondition = new Condition(
        'for page complete check script to return true',
        function(d) {
          return d.executeScript(pageCompleteCheck).then(function(t) {
            return t === true;
          });
        }
      );

      return Promise.try(function() {
        log.debug(
          "Waiting for script '%s' at most %d ms",
          pageCompleteCheck,
          pageCompleteCheckTimeout
        );
        return driver.wait(
          pageCompleteCheckCondition,
          pageCompleteCheckTimeout
        );
      }).timeout(
        pageCompleteCheckTimeout,
        "Running page complete check '" + pageCompleteCheck + "' took too long."
      );
    }

    return getUrl()
      .then(confirmUrlSuccessfullyLoaded)
      .then(waitForPageCompletion)
      .catch(WebDriverError, e => {
        // Trying to catch Chrome not reachable error on Linux
        log.info(
          'Catched a WebDriverError [' + e.message + ']. Try one more time.' + e
        );
        // wait one second and test again, hopefully everything is ok?!
        return Promise.delay(1000)
          .then(getUrl)
          .then(confirmUrlSuccessfullyLoaded)
          .then(waitForPageCompletion)
          .catch(WebDriverError, e => {
            log.error('WebDriverError:' + e);
            throw new UrlLoadError(
              'Failed to load ' + url + ', cause: ' + encodeError(e).message,
              url,
              {
                cause: e
              }
            );
          });
      })
      .catch(e => {
        log.error('Could not load URL' + e);
        throw new UrlLoadError('Failed to load ' + url, url, {
          cause: e
        });
      });
  }

  takeScreenshot() {
    return Promise.resolve(this.driver.takeScreenshot()).then(
      base64EncodedPng => new Buffer(base64EncodedPng, 'base64')
    );
  }

  runScript(script, name, args) {
    let scriptTimeout = this.options.timeouts.script;

    return Promise.try(() => {
      if (log.isEnabledFor(log.TRACE)) {
        log.verbose('Executing script %s', script);
      } else if (log.isEnabledFor(log.VERBOSE)) {
        log.verbose('Executing script %s', name);
      }
      return this.driver.executeScript(script, args);
    })
      .catch(e => {
        log.error("Couldn't execute script named " + name + ' error:' + e);
        throw e;
      })
      .timeout(scriptTimeout, "Running script '" + script + "' took too long.");
  }

  runAsyncScript(script, name, args) {
    return Promise.try(() => {
      if (log.isEnabledFor(log.TRACE)) {
        log.verbose('Executing async script %s', script);
      } else if (log.isEnabledFor(log.VERBOSE)) {
        log.verbose('Executing async script %s', name);
      }
      return this.driver.executeAsyncScript(script, args);
    });
  }

  runWithDriver(driverScript) {
    return driverScript(this.driver);
  }

  getLogs(logType) {
    return Promise.resolve(this.driver.manage().logs().get(logType));
  }

  stop() {
    if (this.driver) {
      return Promise.try(() => {
        log.debug('Telling browser to quit.');
        return this.driver.quit();
      }).catch(e => {
        throw new BrowserError(e.message, {
          cause: e
        });
      });
    }
    return Promise.resolve();
  }
}

module.exports = SeleniumRunner;
