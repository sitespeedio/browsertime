'use strict';

const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const get = require('lodash.get');
const setupChromiumOptions = require('./setupChromiumOptions');

/**
 * Configure a WebDriver builder based on the specified options.
 * @param builder
 * @param {Object} options the options for a web driver.
 */
module.exports.configureBuilder = function (builder, baseDir, options) {
  const chromeConfig = options.chrome || {};

  let chromedriverPath = get(chromeConfig, 'chromedriverPath');
  if (!chromedriverPath) {
    const chromedriver = require('@sitespeed.io/chromedriver');
    chromedriverPath = chromedriver.binPath();
  }

  const serviceBuilder = new chrome.ServiceBuilder(chromedriverPath);

  // Remove the check that matches the Chromedriver version with Chrome version.
  serviceBuilder.addArguments('--disable-build-check');

  if (options.chrome && options.chrome.chromedriverPort) {
    serviceBuilder.setPort(options.chrome.chromedriverPort);
  }
  if (
    options.verbose >= 2 ||
    chromeConfig.enableChromeDriverLog ||
    chromeConfig.enableVerboseChromeDriverLog
  ) {
    serviceBuilder.loggingTo(`${baseDir}/chromedriver.log`);
    if (options.verbose >= 3 || chromeConfig.enableVerboseChromeDriverLog)
      serviceBuilder.enableVerboseLogging();
  }
  builder.setChromeService(serviceBuilder);

  const proxyPacSettings = pick(options.proxy, ['pac']);

  if (!isEmpty(proxyPacSettings)) {
    builder.setProxy(proxy.pac(proxyPacSettings));
  }

  const proxySettings = pick(options.proxy, ['ftp', 'http', 'https', 'bypass']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(proxy.manual(proxySettings));
  }

  let chromeOptions = new chrome.Options();
  let logPrefs = new webdriver.logging.Preferences();
  logPrefs.setLevel(
    webdriver.logging.Type.PERFORMANCE,
    webdriver.logging.Level.ALL
  );

  if (chromeConfig.collectConsoleLog) {
    logPrefs.setLevel(
      webdriver.logging.Type.BROWSER,
      webdriver.logging.Level.ALL
    );
  }

  chromeOptions.setLoggingPrefs(logPrefs);

  builder
    .getCapabilities()
    .set('pageLoadStrategy', get(options, 'pageLoadStrategy', 'normal'))
    .set('goog:loggingPrefs', logPrefs); // Fix for Chrome/Chromedriver 75

  setupChromiumOptions(chromeOptions, chromeConfig, options, baseDir);

  builder.setChromeOptions(chromeOptions);
};
