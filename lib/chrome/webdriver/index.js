'use strict';

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const chromedriver = require('@sitespeed.io/chromedriver');
const get = require('lodash.get');
const fs = require('fs');
const path = require('path');
const defaultChromeOptions = require('./chromeOptions');
const defaultAndroidChromeOptions = require('./chromeAndroidOptions');
const getViewPort = require('../../support/getViewPort');
const util = require('../../support/util');

let hasConfiguredChromeDriverService = false;
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

  let chromeOptions = new chrome.Options();
  chromeOptions.setLoggingPrefs(logPrefs);

  if (options.headless) {
    chromeOptions.headless();
  }

  // If we run in Docker we need to always use no-sandbox
  if (options.docker) {
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-setuid-sandbox');
  }

  if (options.xvfb && (options.xvfb === true || options.xvfb === 'true')) {
    chromeOptions.addArguments('--disable-gpu');
  }

  const viewPort = getViewPort(options);
  // If viewport is defined (only on desktop) then set start args
  if (viewPort) {
    chromeOptions.addArguments('--window-position=0,0');
    chromeOptions.addArguments('--window-size=' + viewPort.replace('x', ','));
  }

  if (chromeConfig.blockDomainsExcept) {
    let excludes = '';
    let excludesDomains = util.toArray(chromeConfig.blockDomainsExcept);
    for (let domain of excludesDomains) {
      excludes += 'MAP * 127.0.0.1, EXCLUDE ' + domain + ',';
    }
    chromeOptions.addArguments('--host-resolver-rules=' + excludes);
  }

  const perfLogConf = { enableNetwork: true, enablePage: true };

  // headless mode doesn't work with extensions
  if (!chromeConfig.disableWebExtensions && !options.headless) {
    chromeOptions.addExtensions(
      fs.readFileSync(
        path.resolve(moduleRootPath, 'vendor', 'browsertime-extension.crx'),
        { encoding: 'base64' }
      )
    );
  }

  if (options.extension) {
    const extensions = !Array.isArray(options.extension)
      ? [options.extension]
      : options.extension;
    for (const extension of extensions) {
      chromeOptions.addExtensions(
        fs.readFileSync(extension, { encoding: 'base64' })
      );
    }
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

  if (chromeConfig.android) {
    defaultAndroidChromeOptions.push(
      '--remote-debugging-port=' + options.devToolsPort
    );
    chromeOptions.addArguments(defaultAndroidChromeOptions);
  } else {
    chromeOptions.addArguments(defaultChromeOptions);
  }

  if (chromeConfig.args) {
    chromeOptions.addArguments(chromeConfig.args);
  }

  if (chromeConfig.binaryPath) {
    chromeOptions.setChromeBinaryPath(chromeConfig.binaryPath);
  }

  if (chromeConfig.mobileEmulation) {
    chromeOptions.setMobileEmulation(chromeConfig.mobileEmulation);
  }

  const connectivity = options.connectivity || {};

  if (
    connectivity.engine === 'tsproxy' &&
    connectivity.tsproxy &&
    connectivity.profile !== 'native'
  ) {
    if (!connectivity.tsproxy.bind) {
      // If you run tsproxy on desktop instead of throttle or Docker networs
      // Configure SOCKS proxy, see https://www.chromium.org/developers/design-documents/network-stack/socks-proxy
      chromeOptions.addArguments(
        '--proxy-server=socks5://localhost:' + connectivity.tsproxy.port
      );
      chromeOptions.addArguments(
        '--host-resolver-rules="MAP * ~NOTFOUND , EXCLUDE localhost"'
      );
    } else {
      // If you run on Android and want to use TSProxy on your desktop
      chromeOptions.addArguments(
        '--proxy-server=socks://' +
          connectivity.tsproxy.bind +
          ':' +
          connectivity.tsproxy.port
      );
    }
  }

  // See https://bugs.chromium.org/p/chromium/issues/detail?id=818483
  // Coming again in Chrome 76
  chromeOptions.excludeSwitches('enable-automation');

  const android = chromeConfig.android;
  if (android) {
    if (android.package) {
      chromeOptions.androidPackage(android.package);
    } else {
      chromeOptions.androidChrome();
    }
    chromeOptions.androidDeviceSerial(android.deviceSerial);
  }

  const proxySettings = pick(options.proxy, ['http', 'https']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(proxy.manual(proxySettings));
  }

  builder
    .getCapabilities()
    .set('pageLoadStrategy', get(options, 'pageLoadStrategy', 'normal'))
    .set('goog:loggingPrefs', logPrefs); // Fix for Chrome/Chromedriver 75

  builder.setChromeOptions(chromeOptions);
};
