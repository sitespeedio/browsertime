'use strict';

let path = require('path'),
  firefox = require('selenium-webdriver/firefox'),
  proxy = require('selenium-webdriver/proxy'),
  pick = require('lodash.pick'),
  isEmpty = require('lodash.isempty'),
  log = require('intel'),
  util = require('../../support/util'),
  get = require('lodash.get'),
  geckodriver = require('soprano-saxophone').geckodriver;

const defaultFirefoxPreferences = {
  /** Old settings that we have used and been inspired by WPT,
    internet in general and our own testing */
  'browser.cache.disk.capacity': 1048576,
  'browser.cache.disk.smart_size.first_run': false,
  'browser.cache.disk.smart_size_cached_value': 1048576,
  'browser.bookmarks.restore_default_bookmarks': false,
  'browser.bookmarks.added_static_root': true,
  'browser.places.importBookmarksHTML': false,
  'browser.newtabpage.enhanced': false,
  'browser.safebrowsing.remotelookups': false,
  'browser.selfsupport.enabled': false,
  'browser.startup.homepage': 'about:blank',
  'extensions.checkCompatibility': false,
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
  'xpinstall.signatures.required': false,
  'browser.newtabpage.directory.ping': '',
  'browser.newtabpage.directory.source': 'data:application/json,{}',
  'browser.newtab.preload': false,
  'pageThumbs.enabled': false,
  // this makes Firefox in Docker 5s faster :/
  'network.dns.disableIPv6': true,

  /**
     * Setting from Mozilla test automation and default
     * when you are using Geckodriver
     * https://github.com/mozilla/geckodriver/commit/2bfdc3ec8151c427a6a75a6ba3ad203459540495#diff-0448b1e0b4c6692f0a18f4ebd3fc3fb3R4
     */

  'browser.warnOnQuit': false,
  'browser.tabs.warnOnClose': false,
  'browser.showQuitWarning': false,
  // Until bug 1238095 is fixed, we have to disable safe CPOW checks
  'dom.ipc.cpows.forbid-unsafe-from-browser': false,
  // Disable automatic downloading of new releases
  'app.update.auto': false,
  // Disable automatically upgrading Firefox
  'app.update.enabled': false,
  // Indicate that the download panel has been shown once so
  // that whichever download test runs first does not show the popup
  // inconsistently
  'browser.download.panel.shown': true,
  // Implicitly accept license
  'browser.EULA.override': true,
  // Turn off once Marionette can correctly handle error pages,
  // and does not hang when about:blank gets loaded twice
  //
  // (bug 1145668, 1312674)
  'browser.newtabpage.enabled': true,
  // Assume the about:newtab pages intro panels have been shown
  // to not depend on which test runs first and happens to open
  // about:newtab
  'browser.newtabpage.introShown': true,
  // Never start the browser in offline mode
  'browser.offline': false,
  // Background thumbnails in particular cause grief, and disabling
  // thumbnails in general cannot hurt
  'browser.pagethumbnails.capturing_disabled': true,
  // Avoid performing Reader Mode intros during tests
  'browser.reader.detectedFirstArticle': true,
  // Disable safebrowsing components
  'browser.safebrowsing.blockedURIs.enabled': false,
  'browser.safebrowsing.downloads.enabled': false,
  'browser.safebrowsing.malware.enabled': false,
  'browser.safebrowsing.phishing.enabled': false,
  // Disable updates to search engines
  'browser.search.update': false,
  // Do not restore the last open set of tabs if the browser crashed
  'browser.sessionstore.resume_from_crash': false,
  // Skip check for default browser on startup
  'browser.shell.checkDefaultBrowser': false,
  // Disable Android snippets
  'browser.snippets.enabled': false,
  'browser.snippets.syncPromo.enabled': false,
  'browser.snippets.firstrunHomepage.enabled': false,
  // Do not redirect user when a milestone upgrade of Firefox
  // is detected
  'browser.startup.homepage_override.mstone': 'ignore',
  // Start with a blank page (about:blank)
  'browser.startup.page': 0,
  // Disable tab animation
  'browser.tabs.animate': false,
  // Do not warn when quitting a window with multiple tabs
  'browser.tabs.closeWindowWithLastTab': false,
  // Do not allow background tabs to be zombified, otherwise for
  // tests that open additional tabs, the test harness tab itself
  // might get unloaded
  'browser.tabs.disableBackgroundZombification': false,
  // Do not warn when closing all other open tabs
  'browser.tabs.warnOnCloseOtherTabs': false,
  // Do not warn when multiple tabs will be opened
  'browser.tabs.warnOnOpen': false,
  // Disable first run splash page on Windows 10
  'browser.usedOnWindows10.introURL': '',
  // Disable the UI tour
  'browser.uitour.enabled': false,
  // Do not show datareporting policy notifications which can
  // interfere with tests
  'datareporting.healthreport.about.reportUrl':
    'http://%(server)s/dummy/abouthealthreport/',
  'datareporting.healthreport.documentServerURI':
    'http://%(server)s/dummy/healthreport/',
  'datareporting.healthreport.logging.consoleEnabled': false,
  'datareporting.healthreport.service.enabled': false,
  'datareporting.healthreport.service.firstRun': false,
  'datareporting.healthreport.uploadEnabled': false,
  'datareporting.policy.dataSubmissionEnabled': false,
  'datareporting.policy.dataSubmissionPolicyAccepted': false,
  'datareporting.policy.dataSubmissionPolicyBypassNotification': true,
  // Disable popup-blocker
  'dom.disable_open_during_load': false,
  // Disable the ProcessHangMonitor
  'dom.ipc.reportProcessHangs': false,
  // Disable slow script dialogues
  'dom.max_chrome_script_run_time': 0,
  'dom.max_script_run_time': 0,
  // Only load extensions from the application and user profile
  // AddonManager.SCOPE_PROFILE + AddonManager.SCOPE_APPLICATION
  // ("extensions.autoDisableScopes", Pref::new(0)),
  // ("extensions.enabledScopes", Pref::new(5)),
  // don't block add-ons for e10s
  // extensions.e10sBlocksEnabling", Pref::new(false)),
  // Disable metadata caching for installed add-ons by default
  // ("extensions.getAddons.cache.enabled", Pref::new(false)),
  // Disable intalling any distribution extensions or add-ons
  'extensions.installDistroAddons': false,
  'extensions.showMismatchUI': false,
  // Turn off extension updates so they do not bother tests
  'extensions.update.enabled': false,
  'extensions.update.notifyUser': false,
  // Make sure opening about:addons will not hit the network
  'extensions.webservice.discoverURL': 'http://%(server)s/dummy/discoveryURL',
  // Allow the application to have focus even it runs in the
  // background
  'focusmanager.testmode': true,
  // Disable useragent updates
  'general.useragent.updates.enabled': false,
  // Always use network provider for geolocation tests so we bypass
  // the macOS dialog raised by the corelocation provider
  // ("geo.provider.testing", Pref::new(true)),
  // Do not scan wi-fi
  'geo.wifi.scan': false,
  // No hang monitor
  'hangmonitor.timeout': 0,
  // Show chrome errors and warnings in the error console
  'javascript.options.showInConsole': true,
  // Make sure the disk cache does not get auto disabled
  'network.http.bypass-cachelock-threshold': 200000,
  // Do not prompt for temporary redirects
  'network.http.prompt-temp-redirect': false,
  // Disable speculative connections so they are not reported as
  // leaking when they are hanging around
  'network.http.speculative-parallel-limit': 0,
  // Do not automatically switch between offline and online
  'network.manage-offline-status': false,
  // Make sure SNTP requests do not hit the network
  'network.sntp.pools': '%(server)s',
  // Local documents have access to all other local docments,
  // including directory listings.
  'security.fileuri.strict_origin_policy': false,
  // Tests don't wait for the notification button security delay
  'security.notification_enable_delay': 0,
  // Ensure blocklist updates don't hit the network
  'services.settings.server': 'http://%(server)s/dummy/blocklist/',
  // Do not automatically fill sign-in forms with known usernames
  // and passwords
  'signon.autofillForms': false,
  // Disable password capture, so that tests that include forms
  // are not influenced by the presence of the persistent doorhanger
  // notification
  'signon.rememberSignons': false,
  // Disable first run pages
  'startup.homepage_welcome_url': 'about:blank',
  'startup.homepage_welcome_url.additional': '',
  // Prevent starting into safe mode after application crashes
  'toolkit.startup.max_resumed_crashes': -1
  // We want to collect telemetry, but we don't want to send in the results
  // ("toolkit.telemetry.server", Pref::new("https://%(server)s/dummy/telemetry/")),
};
module.exports.configureBuilder = function(builder, options) {
  const firefoxConfig = options.firefox || {};
  const moduleRootPath = path.resolve(__dirname, '..', '..', '..');

  const profileTemplatePath = path.resolve(
      moduleRootPath,
      'browsersupport',
      'firefox-profile'
    ),
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

  // HAR export - see http://www.softwareishard.com/blog/har-export-trigger/
  profile.setPreference('extensions.netmonitor.har.enableAutomation', true);
  profile.setPreference('extensions.netmonitor.har.contentAPIToken', 'test');
  profile.setPreference('extensions.netmonitor.har.autoConnect', true);
  profile.setPreference(
    'devtools.netmonitor.har.includeResponseBodies',
    get(options, 'firefox.includeResponseBodies', false)
  );
  profile.setPreference('xpinstall.signatures.required', false);
  // Download from the version page, the default URL shows wrong latest version
  // https://addons.mozilla.org/sv-se/firefox/addon/har-export-trigger/versions/?page=1#version-0.5.0-beta.10
  profile.addExtension(
    path.resolve(
      moduleRootPath,
      'vendor',
      'har_export_trigger-0.5.0-beta.10-fx.xpi'
    )
  );

  // Browsertime own extension
  profile.addExtension(
    path.resolve(moduleRootPath, 'vendor', 'browsertime-0.5.0-an+fx.xpi')
  );

  profile.setPreference('devtools.chrome.enabled', true);

  const userPrefs = util.toArray(firefoxConfig.preference);
  for (const pref of userPrefs) {
    const nameAndValue = pref.split(':');
    if (nameAndValue.length === 2) {
      const value =
        nameAndValue[1] === 'false'
          ? false
          : nameAndValue[1] === 'true' ? true : nameAndValue[1];
      profile.setPreference(nameAndValue[0], value);
    } else {
      log.error(
        'Firefox preferences %s need to of the format key:value, preference was not set',
        pref
      );
    }
  }

  let ffOptions = new firefox.Options();

  let firefoxTypes = [
    get(firefoxConfig, 'binaryPath')
      ? get(firefoxConfig, 'binaryPath')
      : undefined,
    get(firefoxConfig, 'nightly') ? firefox.Channel.NIGHTLY : undefined,
    get(firefoxConfig, 'beta') ? firefox.Channel.BETA : undefined,
    get(firefoxConfig, 'developer') ? firefox.Channel.AURORA : undefined
  ];

  firefoxTypes = firefoxTypes.filter(function(n) {
    return n !== undefined;
  });

  ffOptions.setBinary(
    firefoxTypes.length > 0 ? firefoxTypes[0] : firefox.Channel.RELEASE
  );

  ffOptions.addArguments('-no-remote');

  if (options.headless) {
    ffOptions.headless();
  }
  // ffOptions.setBinary(binary);
  ffOptions.setProfile(profile);

  const proxySettings = pick(options.proxy, ['http', 'https']);

  if (!isEmpty(proxySettings)) {
    ffOptions.setProxy(proxy.manual(proxySettings));
  }

  builder.setFirefoxOptions(ffOptions);

  // ugly hack for geckodriver
  // we need it until Selenium NodeJS version supports setting geckodriver
  // Selenium looks for geckodriver in the PATH.
  const geckoPath = path.dirname(geckodriver.binPath());
  process.env.PATH = [geckoPath, process.env.PATH].join(path.delimiter);
};
