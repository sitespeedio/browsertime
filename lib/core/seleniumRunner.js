'use strict';

const util = require('util'),
  Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  webdriver = require('selenium-webdriver'),
  WebDriverError = webdriver.error.WebDriverError,
  encodeError = webdriver.error.encodeError,
  until = webdriver.until,
  builder = require('./webdriverBuilder'),
  UrlLoadError = require('../support/errors').UrlLoadError,
  BrowserError = require('../support/errors').BrowserError;

const defaultPageCompleteCheck = 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 2000;} catch(e) {} return true;})()';
const defaults = {
  timeouts: {
    browserStart: 60000,
    pageLoad: 120000,
    script: 40000,
    pageCompleteCheck: 120000
  }
};

class SeleniumRunner {
  constructor(options) {
    this.options = merge({}, defaults, options);
  }

  start() {
    function startBrowser() {
      return Promise.try(() => builder.createWebDriver(this.options)
          .tap((driver) => {
            this.driver = driver;
          }))
        .timeout(this.options.timeouts.browserStart,
          new BrowserError(util.format('Failed to start browser in %d seconds.',
            this.options.timeouts.browserStart / 1000)));
    }

    return startBrowser.call(this)
      .catch(Promise.TimeoutError, () => {
        log.info('Browser failed to start in time, trying one more time.');
        return startBrowser.call(this);
      })
      .tap(() => {
        let timeouts = this.driver.manage().timeouts(),
          pageLoadTimeout = this.options.timeouts.pageLoad,
          scriptTimeout = this.options.timeouts.script;

        return timeouts.pageLoadTimeout(pageLoadTimeout)
          .then(() => timeouts.setScriptTimeout(scriptTimeout));
      })
      .tap(() => {
        let viewPort = this.options.viewPort;
        if (viewPort) {
          viewPort = viewPort.split('x');

          const window = this.driver.manage().window();
          return window.setPosition(0, 0)
            .then(() => window.setSize(Number(viewPort[0]), Number(viewPort[1])));
        }
      }).catch((err) => {
        if (err.name !== 'BrowserError')
          throw new BrowserError(err.message, {
            cause: err
          });
        else throw err;
      });
  }

  loadAndWait(url, pageCompleteCheck) {
    pageCompleteCheck = pageCompleteCheck || defaultPageCompleteCheck;

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

      return Promise.resolve(driver.executeScript('return document.documentURI;'))
        .then((uri) => {
          if (!uri.match(/^http(s)?:\/\//i))
            throw new UrlLoadError('Failed to load ' + url, {
              url
            });
        });
    }

    function waitForPageCompletion() {
      let pageCompleteCheckCondition = new until.Condition(
        'for page complete check script to return true',
        function(d) {
          return d.executeScript(pageCompleteCheck)
            .then(function(t) {
              return t === true;
            });
        });

      return Promise
        .try(function() {
          log.debug('Waiting for script \'%s\' at most %d ms', pageCompleteCheck, pageCompleteCheckTimeout);
          return driver.wait(pageCompleteCheckCondition, pageCompleteCheckTimeout);
        })
        .timeout(pageCompleteCheckTimeout, 'Running page complete check \'' + pageCompleteCheck + '\' took too long.');
    }

    return getUrl()
      .then(confirmUrlSuccessfullyLoaded)
      .then(waitForPageCompletion)
      .catch(WebDriverError, (e) => {
        throw new UrlLoadError('Failed to load ' + url + ', cause: ' + encodeError(e).message, {
          url,
          cause: e
        })
      });
  }

  takeScreenshot() {
    return Promise.resolve(this.driver.takeScreenshot())
      .then((base64EncodedPng) =>
        new Buffer(base64EncodedPng, 'base64'));
  }

  runScript(script, name, args) {
    let scriptTimeout = this.options.timeouts.script;

    return Promise
      .try(() => {
        if (log.isEnabledFor(log.TRACE)) {
          log.verbose('Executing script %s', script);
        } else if (log.isEnabledFor(log.VERBOSE)) {
          log.verbose('Executing script %s', name);
        }
        return this.driver.executeScript(script, args);
      })
      .timeout(scriptTimeout, 'Running script \'' + script + '\' took too long.');
  }

  runAsyncScript(script, name, args) {
    return Promise
      .try(() => {
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
      }).catch((err) => {
        if (err.name != 'BrowserError' && err.name != 'UrlLoadError')
          throw new BrowserError(err.message, {
            cause: err
          });
        else
          throw err;
      });
    }
    return Promise.resolve();
  }
}

module.exports = SeleniumRunner;
