'use strict';

let webdriver = require('selenium-webdriver'),
  chrome = require('selenium-webdriver/chrome'),
  chromedriver = require('alto-saxophone').chromedriver;

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
  '--process-per-tab',
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

/**
 * Configure a WebDriver builder based on the specified options.
 * @param builder
 * @param {Object} options the options for a web driver.
 */
module.exports.configureBuilder = function(builder, options) {
  if (!hasConfiguredChromeDriverService) {
    let serviceBuilder = new chrome.ServiceBuilder(chromedriver.binPath());
    if (options.verbose >= 2) {
      serviceBuilder
        .loggingTo('./chromedriver.log');
      if (options.verbose >= 3)
        serviceBuilder.enableVerboseLogging();
    }
    chrome.setDefaultService(serviceBuilder.build());

    hasConfiguredChromeDriverService = true;
  }

  let logPrefs = new webdriver.logging.Preferences();
  logPrefs.setLevel(webdriver.logging.Type.PERFORMANCE,
    webdriver.logging.Level.INFO);

  const chromeConfig = options.chrome || {};

  let chromeOptions = new chrome.Options();

  chromeOptions.setLoggingPrefs(logPrefs);
  chromeOptions.setPerfLoggingPrefs({enableNetwork: true, enablePage: true, traceCategories: 'blink.user_timing'});

  if (options.userAgent) {
    chromeOptions.addArguments('--user-agent=' + options.userAgent);
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

  const connectivity = options.connectivity || {};

  if (connectivity.engine === 'tsproxy' &&
    connectivity.tsproxy &&
    connectivity.profile !== 'native') {
    // Configure SOCKS proxy, see https://www.chromium.org/developers/design-documents/network-stack/socks-proxy
    chromeOptions.addArguments('--proxy-server=socks5://localhost:' + connectivity.tsproxy.port);
    chromeOptions.addArguments('--host-resolver-rules="MAP * ~NOTFOUND , EXCLUDE localhost"');
  }

  builder.setChromeOptions(chromeOptions);
};
