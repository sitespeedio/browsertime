'use strict';

let path = require('path'),
  firefox = require('selenium-webdriver/firefox'),
  geckodriver = require('soprano-saxophone').geckodriver;

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
 * Configure a WebDriver builder based on the specified options.
 * @param builder
 * @param proxyConfig
 * @param {Object} options the options for a web driver.
 */
module.exports.configureBuilder = function(builder, proxyConfig, options) {
  const moduleRootPath = path.resolve(__dirname, '..', '..', '..');

  const profileTemplatePath = path.resolve(moduleRootPath, 'browsersupport', 'firefox-profile'),
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

  const connectivity = options.connectivity || {};

  if (connectivity.engine === 'tsproxy' &&
    connectivity.tsproxy &&
    connectivity.profile !== 'native') {
    profile.setPreference("network.proxy.socks", "localhost");
    profile.setPreference("network.proxy.socks_port", connectivity.tsproxy.port);
    profile.setPreference("network.proxy.type", 1);
  }

  // HAR export - see http://www.softwareishard.com/blog/har-export-trigger/
  profile.setPreference('extensions.netmonitor.har.enableAutomation', true);
  profile.setPreference('extensions.netmonitor.har.contentAPIToken', 'test');
  profile.setPreference('extensions.netmonitor.har.autoConnect', true);
  profile.setPreference('devtools.netmonitor.har.includeResponseBodies', false);

  profile.setPreference('xpinstall.signatures.required', false);
  // Download from the version page, the default URL shows wrong latest version
  // https://addons.mozilla.org/sv-se/firefox/addon/har-export-trigger/versions/?page=1#version-0.5.0-beta.10
  profile.addExtension(path.resolve(moduleRootPath, 'vendor', 'har_export_trigger-0.5.0-beta.10-fx.xpi'));

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

  // ugly hack for geckodriver
  // we need it until Selenium NodeJS version supports setting geckodriver
  // Selenium looks for geckodriver in the PATH.
  const geckoPath = path.dirname(geckodriver.binPath());
  process.env.PATH = [geckoPath, process.env.PATH].join(path.delimiter);
};
