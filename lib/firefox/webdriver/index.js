'use strict';

const path = require('path');
const firefox = require('selenium-webdriver/firefox');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const log = require('intel').getLogger('browsertime.firefox');
const get = require('lodash.get');
const defaultFirefoxPreferences = require('./firefoxPreferences');
const disableSafeBrowsingPreferences = require('./disableSafeBrowsingPreferences');
const util = require('../../support/util');

module.exports.configureBuilder = function(builder, baseDir, options) {
  const firefoxConfig = options.firefox || {};
  const moduleRootPath = path.resolve(__dirname, '..', '..', '..');
  const ffOptions = new firefox.Options();

  const profileTemplatePath = path.resolve(
    moduleRootPath,
    'browsersupport',
    'firefox-profile'
  );

  ffOptions.setProfile(profileTemplatePath);

  if (options.userAgent) {
    ffOptions.setPreference('general.useragent.override', options.userAgent);
  }

  if (firefoxConfig.collectMozLog) {
    process.env.MOZ_LOG =
      'timestamp,nsHttp:5,cache2:5,nsSocketTransport:5,nsHostResolver:5';
    process.env.MOZ_LOG_FILE = `${baseDir}/moz_log.txt`;
  }

  // Output the window recorder image frames to a base directory.
  // This pref expects a trailing slash.
  if (firefoxConfig.windowRecorder) {
    ffOptions.setPreference('layers.windowrecording.path', `${baseDir}/`);
  }

  Object.keys(defaultFirefoxPreferences).forEach(function(pref) {
    ffOptions.setPreference(pref, defaultFirefoxPreferences[pref]);
  });

  if (firefoxConfig.disableSafeBrowsing) {
    Object.keys(disableSafeBrowsingPreferences).forEach(function(pref) {
      ffOptions.setPreference(pref, disableSafeBrowsingPreferences[pref]);
    });
  }

  if (!options.skipHar) {
    // Hack for opening the toolbar
    // In Firefox 61 we need to have devtools open but do not need to choose netmonitor
    // ffOptions.setPreference('devtools.toolbox.selectedTool', 'netmonitor');
    ffOptions.setPreference('devtools.toolbox.footer.height', 0);
    ffOptions.addArguments('-devtools');

    ffOptions.addExtensions(
      path.resolve(
        moduleRootPath,
        'vendor',
        'har_export_trigger-0.6.1-an+fx.xpi'
      )
    );
  }

  // Browsertime own extension, only load it when we need it
  // We should be able to only install it only when needed, but that could break scripting

  if (!firefoxConfig.disableBrowsertimeExtension) {
    ffOptions.addExtensions(
      path.resolve(moduleRootPath, 'vendor', 'browsertime-0.18.0-an+fx.xpi')
    );
  }

  if (options.extension) {
    const extensions = !Array.isArray(options.extension)
      ? [options.extension]
      : options.extension;
    for (const extension of extensions) {
      ffOptions.addExtensions(extension);
    }
  }

  ffOptions.setPreference('devtools.chrome.enabled', true);

  const userPrefs = util.toArray(firefoxConfig.preference);
  for (const pref of userPrefs) {
    const nameAndValue = pref.split(':');
    if (nameAndValue.length === 2) {
      const value =
        nameAndValue[1] === 'false'
          ? false
          : nameAndValue[1] === 'true'
          ? true
          : nameAndValue[1];
      // Firefox handles 0, "0", false differently. Turning of OSCP
      // security.OCSP.enabled:0
      // Only accepts a zero as integer
      if (isNaN(value)) {
        ffOptions.setPreference(nameAndValue[0], value);
      } else {
        ffOptions.setPreference(nameAndValue[0], Number(value));
      }
    } else {
      log.error(
        'Firefox preferences %s need to of the format key:value, preference was not set',
        pref
      );
    }
  }

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

  if (firefoxConfig.acceptInsecureCerts) {
    builder.getCapabilities().set('acceptInsecureCerts', true);
  }

  const connectivity = options.connectivity || {};

  if (
    connectivity.engine === 'tsproxy' &&
    connectivity.tsproxy &&
    connectivity.profile !== 'native'
  ) {
    ffOptions.setPreference('network.proxy.socks', 'localhost');
    ffOptions.setPreference(
      'network.proxy.socks_port',
      connectivity.tsproxy.port
    );
    ffOptions.setPreference('network.proxy.type', 1);
  }
  builder
    .getCapabilities()
    .set('pageLoadStrategy', get(options, 'pageLoadStrategy', 'normal'));

  if (options.android) {
    // Monkey patch to avoid changing `selenium-webdriver` before the
    // corresponding `geckodriver` functionality has been replaced:
    // see this [Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1525126)
    // currently under review.
    const android = firefoxConfig.android;
    if (android && android.package) {
      ffOptions.firefoxOptions_().androidPackage = android.package;
      if (android && android.activity) {
        ffOptions.firefoxOptions_().androidActivity = android.activity;
      }
    } else {
      ffOptions.firefoxOptions_().androidPackage = 'org.mozilla.firefox';
      ffOptions.firefoxOptions_().androidActivity = '.App';
    }
    if (android && android.deviceSerial) {
      ffOptions.firefoxOptions_().androidDeviceSerial = android.deviceSerial;
    }
    if (android && android.intentArgument) {
      ffOptions.firefoxOptions_().androidIntentArguments = (
        ffOptions.firefoxOptions_().androidIntentArguments || []
      ).concat(...util.toArray(android.intentArgument));
    }
  }

  const proxySettings = pick(options.proxy, ['http', 'https']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(proxy.manual(proxySettings));
  }

  builder.setFirefoxOptions(ffOptions);

  // Ugly hack for geckodriver
  // We need it until Selenium NodeJS version supports setting geckodriver
  // Selenium looks for geckodriver in the PATH.
  let geckodriverPath = get(firefoxConfig, 'geckodriverPath');
  if (!geckodriverPath) {
    const geckodriver = require('@sitespeed.io/geckodriver');
    geckodriverPath = geckodriver.binPath();
  }

  log.info(`geckodriver is ${geckodriverPath}`);

  const geckoPath = path.dirname(geckodriverPath);
  process.env.PATH = [geckoPath, process.env.PATH].join(path.delimiter);
};
