'use strict';

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const chromedriver = require('alto-saxophone').chromedriver;
const log = require('intel');
const get = require('lodash.get');
const path = require('path');
const defaultChromeOptions = require('./chromeOptions');
const getViewPort = require('../../support/getViewPort');

let hasConfiguredChromeDriverService = false;
const defaultTimelineTraceCategories =
  '-*, toplevel, blink.console,blink.user_timing, devtools.timeline, disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,disabled-by-default-devtools.timeline.stack';

/**
 * Configure a WebDriver builder based on the specified options.
 * @param builder
 * @param {Object} options the options for a web driver.
 */
module.exports.configureBuilder = function(builder, baseDir, options) {
  const chromeConfig = options.chrome || {};
  const moduleRootPath = path.resolve(__dirname, '..', '..', '..');

  if (!hasConfiguredChromeDriverService) {
    const chromedriverPath = get(
      chromeConfig,
      'chromedriverPath',
      chromedriver.binPath()
    );

    let serviceBuilder = new chrome.ServiceBuilder(chromedriverPath);
    if (options.verbose >= 2) {
      serviceBuilder.loggingTo(`${baseDir}/chromedriver.log`);
      if (options.verbose >= 3) serviceBuilder.enableVerboseLogging();
    }
    chrome.setDefaultService(serviceBuilder.build());

    hasConfiguredChromeDriverService = true;
  }

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

  if (chromeConfig.traceCategories) {
    chromeConfig.collectTracingEvents = true;
  }
  if (chromeConfig.collectTracingEvents) {
    chromeConfig.collectPerfLog = true;
  }

  let chromeOptions = new chrome.Options();

  const proxySettings = pick(options.proxy, ['http', 'https']);

  if (!isEmpty(proxySettings)) {
    chromeOptions.setProxy(proxy.manual(proxySettings));
  }

  chromeOptions.setLoggingPrefs(logPrefs);

  if (options.headless) {
    chromeOptions.headless();
  }

  // If we run in Docker we need to always use no-sandbox
  if (options.docker) {
    chromeOptions.addArguments('--no-sandbox');
  }
  const viewPort = getViewPort(options);
  // If viewport is defined (only on desktop) then set start args
  if (viewPort) {
    chromeOptions.addArguments('--window-position=0,0');
    chromeOptions.addArguments('--window-size=' + viewPort.replace('x', ','));
  }

  const perfLogConf = { enableNetwork: true, enablePage: true };

  if (chromeConfig.collectTracingEvents) {
    perfLogConf.traceCategories =
      chromeConfig.traceCategories || defaultTimelineTraceCategories;
    if (chromeConfig.traceCategories) {
      log.info('Use Chrome trace categories: %s', chromeConfig.traceCategories);
    }
  }

  // headless mode doesn't work with extensions
  if (!chromeConfig.disableWebExtensions && !options.headless) {
    chromeOptions.addExtensions(
      path.resolve(moduleRootPath, 'vendor', 'browsertime-extension.crx')
    );
  }

  chromeOptions.setPerfLoggingPrefs(perfLogConf);

  if (options.userAgent) {
    chromeOptions.addArguments('--user-agent=' + options.userAgent);
  }

  if (chromeConfig.collectNetLog) {
    // FIXME this shouldn't hard code path to external storage
    const dir = !chromeConfig.android ? baseDir : '/sdcard';
    chromeOptions.addArguments(`--log-net-log=${dir}/chromeNetlog.json`);
    chromeOptions.addArguments('--net-log-capture-mode=0');
  }

  chromeOptions.addArguments(defaultChromeOptions);

  if (chromeConfig.args) {
    chromeOptions.addArguments(chromeConfig.args);
  }

  if (chromeConfig.binaryPath) {
    chromeOptions.setChromeBinaryPath(chromeConfig.binaryPath);
  }

  if (chromeConfig.mobileEmulation) {
    chromeOptions.setMobileEmulation(chromeConfig.mobileEmulation);
  }

  const android = chromeConfig.android;
  if (android) {
    if (android.package) {
      chromeOptions.androidPackage(android.package);
    } else {
      chromeOptions.androidChrome();
    }
    chromeOptions.androidDeviceSerial(android.deviceSerial);
  }

  builder
    .getCapabilities()
    .set('pageLoadStrategy', get(options, 'pageLoadStrategy', 'none'));

  builder.setChromeOptions(chromeOptions);
};
