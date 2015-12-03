'use strict';

let Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  webdriver = require('selenium-webdriver'),
  builder = require('./webdriver_builder');
let until = webdriver.until;

const defaultPageCompleteCheck = 'return window.performance.timing.loadEventEnd>0';
const defaults = {
  'timeouts': {
    'pageLoad': 10000,
    'script': 5000,
    'pageCompleteCheck': 10000
  }
};

class SeleniumRunner {
  constructor(options) {
    this.options = merge({}, defaults, options);
  }

  start() {
    log.verbose('Creating WebDriver');
    return Promise.try(() => {
        this.driver = builder.createWebDriver(this.options);
      })
      .then(() => this.driver.getCapabilities())
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

    return getUrl().then(waitForPageCompletion);
  }

  runScript(script) {
    let scriptTimeout = this.options.timeouts.script;

    return Promise
      .try(() => {
        if (log.isEnabledFor(log.TRACE)) {
          log.debug('Executing script in browser: %s', script);
        } else {
          log.debug('Executing script in browser');
        }
        return this.driver.executeScript(script);
      })
      .timeout(scriptTimeout, 'Running script \'' + script + '\' took too long.');
  }

  stop() {
    if (this.driver) {
      return Promise.try(() => {
        log.debug('Telling browser to quit.');
        return this.driver.quit();
      });
    }
    return Promise.resolve();
  }
}

module.exports = SeleniumRunner;
