'use strict';

let Promise = require('bluebird'),
  webdriver = require('selenium-webdriver'),
  chrome = require('./chrome'),
  firefox = require('./firefox');

/**
 * Create a new WebDriver instance based on the specified options.
 * @param {Object} options the options for a web driver.
 * @returns {!Promise<webdriver.WebDriver>} a promise that resolves to the webdriver,
 * or rejects if the current configuration is invalid.
 */
module.exports.createWebDriver = function(options) {
  const browser = options.browser || 'chrome';
  const seleniumUrl = options.selenium ? options.selenium.url : undefined;
  const builder = new webdriver.Builder()
    .forBrowser(browser)
    .usingServer(seleniumUrl);

  switch (browser) {
    case 'chrome':
      chrome.configureBuilder(builder, options);
      break;

    case 'firefox':
      firefox.configureBuilder(builder, options);
      break;

    default:
      return Promise.reject(new Error('Unsupported browser: ' + browser));
  }

  return Promise.try(() => builder.build());
};
