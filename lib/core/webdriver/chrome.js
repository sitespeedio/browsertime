'use strict';

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const chromedriver = require('alto-saxophone').chromedriver;
const log = require('intel');
const get = require('lodash.get');
const set = require('lodash.set');
const path = require('path');

let hasConfiguredChromeDriverService = false;
const defaultChromeOptions = [
  // disable caching
  // '--disable-cache',
  // '--disk-cache-size=0',
  // '--disable-application-cache',

  '--disable-plugins-discovery',
  '--disable-bundled-ppapi-flash',
  '--enable-experimental-extension-apis',
  '--disable-background-networking',
  '--no-default-browser-check',
  '--no-first-run',
  '--new-window',
  '--disable-translate',
  '--disable-infobars',
  '--disable-desktop-notifications',
  '--allow-running-insecure-content',
  '--disable-save-password-bubble',
  '--disable-component-update',
  '--disable-background-downloads',
  '--disable-add-to-shelf',
  '--disable-client-side-phishing-detection',
  '--disable-datasaver-prompt',
  '--disable-default-apps',
  '--disable-domain-reliability',
  '--safebrowsing-disable-auto-update',
  '--ignore-certificate-errors'
];

const defaultTimelineTraceCategories =
  '-*, toplevel, blink.console,blink.user_timing, devtools.timeline, disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,disabled-by-default-devtools.timeline.stack';

function migrateLegacyOption(options, from, to) {
  if (get(options, from)) {
    log.warn(
      `The option ${from} has been renamed to ${
        to
      }. The old option will be removed in a future version.`
    );
    set(options, to, true);
  }
}

/**
 * Configure a WebDriver builder based on the specified options.
 * @param builder
 * @param {Object} options the options for a web driver.
 */
module.exports.configureBuilder = function(builder, options) {
  const chromeConfig = options.chrome || {};
  const moduleRootPath = path.resolve(__dirname, '..', '..', '..');

  migrateLegacyOption(
    options,
    'experimental.dumpChromePerflog',
    'chrome.collectPerfLog'
  );
  migrateLegacyOption(
    options,
    'chrome.dumpTraceCategoriesLog',
    'chrome.collectTracingEvents'
  );

  if (!hasConfiguredChromeDriverService) {
    const chromedriverPath = get(
      chromeConfig,
      'chromedriverPath',
      chromedriver.binPath()
    );

    let serviceBuilder = new chrome.ServiceBuilder(chromedriverPath);
    if (options.verbose >= 2) {
      serviceBuilder.loggingTo('./chromedriver.log');
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
    chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--disable-gpu');
  }

  // If we run in Docker we need to always use no-sandbox
  if (options.docker) {
    chromeOptions.addArguments('--no-sandbox');
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
    const dir = !chromeConfig.android ? options.baseDir : '/sdcard';
    chromeOptions.addArguments(
      `--log-net-log=${dir}/chromeNetlog-${options.index}.json`
    );
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

  builder.setChromeOptions(chromeOptions);
};
