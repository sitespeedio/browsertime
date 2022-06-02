'use strict';

const path = require('path');
const firefox = require('selenium-webdriver/firefox');
const log = require('intel').getLogger('browsertime.firefox');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const get = require('lodash.get');
const defaultFirefoxPreferences = require('../settings/firefoxPreferences');
const disableSafeBrowsingPreferences = require('../settings/disableSafeBrowsingPreferences');
const disableTrackingProtectionPreferences = require('../settings/disableTrackingProtectionPreferences');
const util = require('../../support/util');
const { Android } = require('../../android');

module.exports.configureBuilder = function (builder, baseDir, options) {
  // Here we configure everything that we need to start Firefox
  const firefoxConfig = options.firefox || {};
  const moduleRootPath = path.resolve(__dirname, '..', '..', '..');

  let geckodriverPath = get(firefoxConfig, 'geckodriverPath');
  if (!geckodriverPath) {
    const geckodriver = require('@sitespeed.io/geckodriver');
    geckodriverPath = geckodriver.binPath();
  }

  const serviceBuilder = new firefox.ServiceBuilder(geckodriverPath);
  if (options.verbose >= 2) {
    // This echoes the output from geckodriver to the console.
    serviceBuilder.setStdio('inherit');
    // TODO: serviceBuilder.loggingTo(`${baseDir}/geckodriver.log`);
    if (options.verbose >= 3) {
      serviceBuilder.enableVerboseLogging(true);
    }
  }

  // https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html
  let geckodriverArgs = get(firefoxConfig, 'geckodriverArgs');
  if (geckodriverArgs) {
    if (!Array.isArray(geckodriverArgs)) geckodriverArgs = [geckodriverArgs];
    for (let arg of geckodriverArgs) {
      serviceBuilder.addArguments(arg);
    }
  }

  builder.setFirefoxService(serviceBuilder);

  const ffOptions = new firefox.Options();

  const profileTemplatePath = path.resolve(
    moduleRootPath,
    'browsersupport',
    'firefox-profile'
  );

  ffOptions.setProfile(
    get(firefoxConfig, 'profileTemplate') || profileTemplatePath
  );

  if (options.userAgent) {
    ffOptions.setPreference('general.useragent.override', options.userAgent);
  }

  if (firefoxConfig.collectMozLog) {
    process.env.MOZ_LOG = firefoxConfig.setMozLog;
    process.env.MOZ_LOG_FILE = `${baseDir}/moz_log.txt`;
  }

  // Output the window recorder image frames to a base directory.
  // This pref expects a trailing slash.
  if (firefoxConfig.windowRecorder) {
    if (options.android) {
      const android = new Android(options);
      const pathToRecording = android.getFullPathOnSdCard(
        'browsertime-firefox-windowrecording'
      );
      ffOptions.setPreference(
        'layers.windowrecording.path',
        `${pathToRecording}/`
      );
    } else {
      ffOptions.setPreference('layers.windowrecording.path', `${baseDir}/`);
    }
  }

  if (!firefoxConfig.noDefaultPrefs) {
    Object.keys(defaultFirefoxPreferences).forEach(function (pref) {
      ffOptions.setPreference(pref, defaultFirefoxPreferences[pref]);
    });
  } else {
    log.info('Skip setting default preferences for Firefox');
  }

  if (firefoxConfig.disableSafeBrowsing) {
    Object.keys(disableSafeBrowsingPreferences).forEach(function (pref) {
      ffOptions.setPreference(pref, disableSafeBrowsingPreferences[pref]);
    });
  }

  if (firefoxConfig.disableTrackingProtection) {
    Object.keys(disableTrackingProtectionPreferences).forEach(function (pref) {
      ffOptions.setPreference(pref, disableTrackingProtectionPreferences[pref]);
    });
  }

  if (options.debug) {
    ffOptions.addArguments('--devtools');
    // Mozilla use detach to make sure you can inspect the browser
    ffOptions.setPreference('detach', true);
  }

  if (!options.skipHar) {
    if (options.android) {
      log.info('Skip install HAR trigger on Android');
    } else {
      // Hack for opening the toolbar
      // In Firefox 61 we need to have devtools open but do not need to choose netmonitor
      // ffOptions.setPreference('devtools.toolbox.selectedTool', 'netmonitor');
      if (!options.debug) {
        ffOptions.setPreference('devtools.toolbox.footer.height', 0);
        ffOptions.addArguments('-devtools');
      }

      ffOptions.addExtensions(
        path.resolve(
          moduleRootPath,
          'vendor',
          'har_export_trigger-0.6.1-an+fx.xpi'
        )
      );
    }
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
  log.debug('Set Firefox preference %j', userPrefs);
  for (const pref of userPrefs) {
    const name = pref.substr(0, pref.indexOf(':'));
    let value = pref.substr(pref.indexOf(':') + 1);
    if (value === 'false') {
      ffOptions.setPreference(name, false);
    } else if (value === 'true') {
      ffOptions.setPreference(name, true);
    } else if (isNaN(value)) {
      ffOptions.setPreference(name, value);
    } else {
      ffOptions.setPreference(name, Number(value));
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

  firefoxTypes = firefoxTypes.filter(function (n) {
    return n !== undefined;
  });

  // Do not set binary when using Android
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1751196

  if (!options.android) {
    ffOptions.setBinary(
      firefoxTypes.length > 0 ? firefoxTypes[0] : firefox.Channel.RELEASE
    );
  }

  ffOptions.addArguments('-no-remote');

  if (firefoxConfig.args) {
    ffOptions.addArguments(firefoxConfig.args);
  }

  const envs = util.toArray(firefoxConfig.env);
  ffOptions.firefoxOptions_().env = ffOptions.firefoxOptions_().env || {};
  for (const env of envs) {
    const name = env.substr(0, env.indexOf('='));
    const value = env.substr(env.indexOf('=') + 1);
    if (options.android) {
      ffOptions.firefoxOptions_().env[name] = value;
    } else {
      process.env[name] = value;
    }
  }

  if (options.headless) {
    ffOptions.headless();
  }

  if (firefoxConfig.acceptInsecureCerts) {
    builder.getCapabilities().set('acceptInsecureCerts', true);
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
      ffOptions.firefoxOptions_().androidActivity =
        'org.mozilla.fenix.IntentReceiverActivity';
    }
    if (android && android.deviceSerial) {
      ffOptions.firefoxOptions_().androidDeviceSerial = android.deviceSerial;
    }

    ffOptions.firefoxOptions_().androidIntentArguments = [
      '-a',
      'android.intent.action.VIEW',
      '-d',
      'about:blank'
    ];

    if (android && android.intentArgument) {
      ffOptions.firefoxOptions_().androidIntentArguments = (
        ffOptions.firefoxOptions_().androidIntentArguments || []
      ).concat(...util.toArray(android.intentArgument));
    }
  }

  const proxyPacSettings = pick(options.proxy, ['pac']);

  if (!isEmpty(proxyPacSettings)) {
    builder.setProxy(proxy.pac(proxyPacSettings));
  }

  const proxySettings = pick(options.proxy, ['ftp', 'http', 'https', 'bypass']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(proxy.manual(proxySettings));
  }

  builder.setFirefoxOptions(ffOptions);
};
