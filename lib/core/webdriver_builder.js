'use strict';

let path = require('path'),
  webdriver = require('selenium-webdriver'),
  chrome = require('selenium-webdriver/chrome'),
  firefox = require('selenium-webdriver/firefox'),
  ie = require('selenium-webdriver/ie'),
  proxy = require('selenium-webdriver/proxy'),
  seleniumserver = require('baryton-saxophone').seleniumServer,
  chromedriver = require('alto-saxophone').chromedriver,
  iedriver = require('tenor-saxophone').iedriver;

let hasConfiguredChromeDriverService = false;
let hasConfiguredIEDriverPath = false;
let defaultChromeOptions = ['--disable-plugins-discovery',
  '--disable-bundled-ppapi-flash',
  '--enable-experimental-extension-apis',
  '--disable-background-networking',
  '--no-default-browser-check',
  '--no-first-run',
  '--process-per-tab',
  '--new-window',
  '--disable-translate',
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
  ' --ignore-certificate-errors'
];


/**
 * Create a new WebDriver instance based on the specified options.
 * @param {Object} options the options for a web driver.
 * @returns {!webdriver.WebDriver} the webdriver
 * @throws Error - If the current configuration is invalid.
 */
module.exports.createWebDriver = function(options) {
  let browser = options.browser || 'chrome';
  let builder = new webdriver.Builder()
    .forBrowser(browser)
    .usingServer(options.seleniumUrl);

  if (options.proxyPort) {
    let proxyHost = options.proxyHost || 'localhost';
    let proxyUrl = proxyHost + ':' + options.proxyPort;
    builder.setProxy(proxy.manual({
      http: proxyUrl,
      https: proxyUrl
    }));
  }

  if (options.seleniumServer) {
    process.env.SELENIUM_SERVER_JAR = seleniumserver.jarPath();
  }

  switch (browser) {
    case 'chrome':
      if (!hasConfiguredChromeDriverService) {
        let serviceBuilder = new chrome.ServiceBuilder(chromedriver.binPath());
        if (options.verbose >= 2) {
          serviceBuilder
            .loggingTo('./chromedriver.log');
        }
        chrome.setDefaultService(serviceBuilder.build());

        hasConfiguredChromeDriverService = true;
      }

      let chromeOptions = new chrome.Options();

      if (options.userAgent) {
        chromeOptions.addArguments('--user-agent=' + options.userAgent);
      }

      chromeOptions.addArguments(defaultChromeOptions);

      if (options.chromeArgs) {
        chromeOptions.addArguments(options.chromeArgs);
      }

      builder.setChromeOptions(chromeOptions);

      break;

    case 'firefox':
      let profile = new firefox.Profile();

      if (options.userAgent) {
        profile.setPreference('general.useragent.override', options.userAgent);
      }

      // try to remove the caching between runs
      profile.setPreference('browser.cache.disk.enable', false);
      profile.setPreference('browser.cache.memory.enable', false);
      profile.setPreference('browser.cache.offline.enable', false);
      profile.setPreference('network.http.use-cache', false);
      profile.setPreference('dom.enable_resource_timing', true);

      let ffOptions = new firefox.Options();
      ffOptions.setProfile(profile);

      builder.setFirefoxOptions(ffOptions);
      break;

    case 'ie':
      let ieOptions = new ie.Options();

      ieOptions.usePerProcessProxy(true);
      ieOptions.ensureCleanSession(true);
      ieOptions.ignoreZoomSetting(true);

      builder.setIeOptions(ieOptions);

      if (!hasConfiguredIEDriverPath) {
        // This is needed since there's no api (yet) to specify a custom driver binary for IE
        process.env.PATH = [iedriver.binPath(), process.env.PATH].join(path.delimiter);
        hasConfiguredIEDriverPath = true;
      }
      break;

    default:
      throw new Error('Unknown browser: ' + browser);
  }

  return builder.build();
};
