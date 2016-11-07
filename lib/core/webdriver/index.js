'use strict';

let Promise = require('bluebird'),
  webdriver = require('selenium-webdriver'),
  chrome = require('./chrome'),
  firefox = require('./firefox'),
  proxy = require('selenium-webdriver/proxy');

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

  let proxyConfig = undefined;

  if (options.proxyPort) {
    let proxyHost = options.proxyHost || 'localhost';
    let proxyUrl = proxyHost + ':' + options.proxyPort;
    proxyConfig = proxy.manual({
      http: proxyUrl,
      ssl: proxyUrl
    });
  }

  switch (browser) {
    case 'chrome':
      chrome.configureBuilder(builder, proxyConfig, options);
      break;

    case 'firefox':
      firefox.configureBuilder(builder, proxyConfig, options);
      break;

    default:
      return Promise.reject(new Error('Unsupported browser: ' + browser));
  }

  return Promise.try(() => builder.build());
};
