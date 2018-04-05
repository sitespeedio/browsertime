'use strict';

const webdriver = require('selenium-webdriver');
const isEmpty = require('lodash.isempty');
const chrome = require('../../chrome/webdriver/');
const firefox = require('../../firefox/webdriver/');

/**
 * Create a new WebDriver instance based on the specified options.
 * @param {Object} options the options for a web driver.
 * @returns {!Promise<webdriver.WebDriver>} a promise that resolves to the webdriver,
 * or rejects if the current configuration is invalid.
 */
module.exports.createWebDriver = async function(baseDir, options) {
  const browser = options.browser || 'chrome';
  const seleniumUrl = options.selenium ? options.selenium.url : undefined;
  const capabilities = options.selenium
    ? options.selenium.capabilities
    : undefined;
  const builder = new webdriver.Builder()
    .forBrowser(browser)
    .usingServer(seleniumUrl);

  // Hack for running browsertime on different platforms.
  // Keep it in the dark for now becasue if you don't know
  // what you do, a lot can get wrong
  if (!isEmpty(capabilities)) {
    builder.withCapabilities(capabilities);
  }

  switch (browser) {
    case 'chrome':
      chrome.configureBuilder(builder, baseDir, options);
      break;

    case 'firefox':
      firefox.configureBuilder(builder, baseDir, options);
      break;

    default:
      return Promise.reject(new Error('Unsupported browser: ' + browser));
  }

  return builder.build();
};
