'use strict';

let Promise = require('bluebird'),
  path = require('path'),
  webdriver = require('selenium-webdriver'),
  chrome = require('selenium-webdriver/chrome'),
  firefox = require('selenium-webdriver/firefox'),
  proxy = require('selenium-webdriver/proxy'),
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

const defaultFirefoxPreferences = {
  // disable caching
  // 'browser.cache.disk.enable': false,
  // 'browser.cache.memory.enable': false,
  // 'browser.cache.offline.enable': false,
  //'network.http.use-cache': false,
  // If we wanna use cache in the future this could be
  // ok settings
  'browser.cache.disk.capacity': 1048576,
  'browser.cache.disk.smart_size.first_run': false,
  'browser.cache.disk.smart_size_cached_value': 1048576,
  // 'browser.cache.disk.capacity': 0,
  // 'browser.cache.disk.smart_size.first_run': false,
  //'browser.cache.disk.smart_size_cached_value': 0,
  'app.update.enabled': false,
  'browser.bookmarks.restore_default_bookmarks': false,
  'browser.bookmarks.added_static_root': true,
  'browser.places.importBookmarksHTML': false,
  'browser.newtabpage.enabled': false,
  'browser.newtabpage.enhanced': false,
  'browser.safebrowsing.enabled': false,
  'browser.safebrowsing.malware.enabled': false,
  'browser.safebrowsing.remotelookups': false,
  'browser.search.update': false,
  'browser.selfsupport.enabled': false,
  'browser.sessionstore.resume_from_crash': false,
  'browser.shell.checkDefaultBrowser': false,
  'browser.startup.homepage': 'about:blank',
  'browser.startup.page': 0,
  'browser.uitour.enabled': false,
  'browser.tabs.warnOnClose': false,
  'datareporting.healthreport.service.enabled': false,
  'datareporting.healthreport.uploadEnabled': false,
  'dom.max_chrome_script_run_time': 0,
  'dom.max_script_run_time': 0,
  'extensions.checkCompatibility': false,
  'extensions.update.enabled': false,
  'extensions.update.notifyUser': false,
  'extensions.shownSelectionUI': true,
  'security.enable_java': false,
  'security.warn_entering_weak': false,
  'security.warn_viewing_mixed': false,
  'security.warn_entering_secure': false,
  'security.warn_leaving_secure': false,
  'security.warn_submit_insecure': false,
  'services.sync.migrated': true,
  'services.sync.engine.bookmarks': false,
  'layers.acceleration.disabled': true,
  'signon.rememberSignons': false,
  'javascript.options.showInConsole': true,
  'xpinstall.signatures.required': false,
  'browser.newtabpage.directory.ping': '',
  'browser.newtabpage.directory.source': 'data:application/json,{}',
  'browser.newtab.preload': false,
  'browser.pagethumbnails.capturing_disabled': true,
  'pageThumbs.enabled': false
};

/**
 * Create a new WebDriver instance based on the specified options.
 * @param {Object} options the options for a web driver.
 * @returns {!Promise<webdriver.WebDriver>} a promise that resolves to the webdriver,
 * or rejects if the current configuration is invalid.
 */
module.exports.createWebDriver = function(options) {
  let browser = options.browser || 'chrome';
  let seleniumUrl = options.selenium ? options.selenium.url : undefined;
    let builder = new webdriver.Builder()
    .forBrowser(browser)
    .usingServer(seleniumUrl);

  let proxyConfig = undefined;

  if (options.proxyPort) {
    let proxyHost = options.proxyHost || 'localhost';
    let proxyUrl = proxyHost + ':' + options.proxyPort;
    proxyConfig = proxy.manual({
      http: proxyUrl,
      https: proxyUrl
    });
  }

  switch (browser) {
    case 'chrome':
    {
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

      if (proxyConfig) {
        chromeOptions.setProxy(proxyConfig);
      }

      chromeOptions.setLoggingPrefs(logPrefs);
      chromeOptions.setPerfLoggingPrefs({enableNetwork: true, enablePage: true});

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

      if (chromeConfig.android && chromeConfig.android.package) {
        chromeOptions.androidChrome();
        chromeOptions.androidPackage = chromeConfig.android.package;

        if (chromeConfig.android.deviceSerial) {
          chromeOptions.androidDeviceSerial = chromeConfig.android.deviceSerial;
        }
      }

      if ((options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tsproxy') && (options.connectivity.profile !== 'native' || options.connectivity.raw )) {
        chromeOptions.addArguments("--proxy-server=socks5://localhost:1080");
        console.log('setting sock ..');
      }

      builder.setChromeOptions(chromeOptions);
    }
      break;

    case 'firefox': {
      const profileTemplatePath = path.resolve(__dirname, '..', '..', 'browsersupport', 'firefox-profile'),
        profile = new firefox.Profile(profileTemplatePath);

      if (options.userAgent) {
        profile.setPreference('general.useragent.override', options.userAgent);
      }

      // try to remove the caching between runs
      /*

       profile.setPreference('dom.enable_resource_timing', true);
       */
      Object.keys(defaultFirefoxPreferences).forEach(function(pref) {
        profile.setPreference(pref, defaultFirefoxPreferences[pref]);
      });

      if ((options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tsproxy') && (options.connectivity.profile !== 'native' || options.connectivity.raw )) {
        profile.setPreference("network.proxy.socks", "localhost");
        profile.setPreference("network.proxy.socks_port", 1080);
        profile.setPreference("network.proxy.type", 1);
        console.log('setting sock ..');
      }

      // HAR export - see http://www.softwareishard.com/blog/har-export-trigger/
      profile.setPreference('extensions.netmonitor.har.enableAutomation', true);
      profile.setPreference('extensions.netmonitor.har.contentAPIToken', 'test');
      profile.setPreference('extensions.netmonitor.har.autoConnect', true);
      profile.setPreference('devtools.netmonitor.har.includeResponseBodies', false);

      profile.setPreference('xpinstall.signatures.required', false);
      profile.addExtension(path.resolve(__dirname, '..', '..', 'vendor', 'harexporttrigger-0.5.0-beta.10.xpi'));

      profile.setPreference('devtools.chrome.enabled', true);

      const firefoxConfig = options.firefox || {};

      let ffOptions = new firefox.Options();
      const binary = new firefox.Binary(firefoxConfig.binaryPath);
      binary.addArguments('-no-remote');
      ffOptions.setBinary(binary);
      ffOptions.setProfile(profile);

      if (proxyConfig) {
        ffOptions.setProxy(proxyConfig);
      }

      builder.setFirefoxOptions(ffOptions);
    }
      break;

    default:
      return Promise.reject(new Error('Unsupported browser: ' + browser));
  }

  return Promise.try(() => builder.buildAsync());
};
