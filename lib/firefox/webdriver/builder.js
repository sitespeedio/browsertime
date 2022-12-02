import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  ServiceBuilder,
  Options,
  Channel
} from 'selenium-webdriver/firefox.js';
import intel from 'intel';
import { pac, manual } from 'selenium-webdriver/proxy.js';
import pick from 'lodash.pick';
import isEmpty from 'lodash.isempty';
import get from 'lodash.get';
import { defaultFirefoxPreferences } from '../settings/firefoxPreferences.js';
import { disableSafeBrowsingPreferences } from '../settings/disableSafeBrowsingPreferences.js';
import { disableTrackingProtectionPreferences } from '../settings/disableTrackingProtectionPreferences.js';
import { toArray } from '../../support/util.js';
import { Android, isAndroidConfigured } from '../../android/index.js';
const log = intel.getLogger('browsertime.firefox');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function configureBuilder(builder, baseDir, options) {
  // Here we configure everything that we need to start Firefox
  const firefoxConfig = options.firefox || {};
  const moduleRootPath = resolve(__dirname, '..', '..', '..');

  let geckodriverPath = get(firefoxConfig, 'geckodriverPath');
  if (!geckodriverPath) {
    const geckodriver = await import('@sitespeed.io/geckodriver');
    geckodriverPath = geckodriver.default.binPath();
  }

  const serviceBuilder = new ServiceBuilder(geckodriverPath);
  if (options.verbose >= 2) {
    // This echoes the output from geckodriver to the console.
    serviceBuilder.setStdio('inherit');
    // TODO: serviceBuilder.loggingTo(`${baseDir}/geckodriver.log`);
    if (options.verbose >= 3) {
      serviceBuilder.enableVerboseLogging(true);
    }
  }

  // https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html
  let geckodriverArguments = get(firefoxConfig, 'geckodriverArgs');
  if (geckodriverArguments) {
    if (!Array.isArray(geckodriverArguments))
      geckodriverArguments = [geckodriverArguments];
    for (let argument of geckodriverArguments) {
      serviceBuilder.addArguments(argument);
    }
  }

  builder.setFirefoxService(serviceBuilder);

  const ffOptions = new Options();

  const profileTemplatePath = resolve(
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
    if (isAndroidConfigured(options)) {
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
    for (const pref of Object.keys(defaultFirefoxPreferences)) {
      ffOptions.setPreference(pref, defaultFirefoxPreferences[pref]);
    }
  } else {
    log.info('Skip setting default preferences for Firefox');
  }

  if (firefoxConfig.disableSafeBrowsing) {
    for (const pref of Object.keys(disableSafeBrowsingPreferences)) {
      ffOptions.setPreference(pref, disableSafeBrowsingPreferences[pref]);
    }
  }

  if (firefoxConfig.disableTrackingProtection) {
    for (const pref of Object.keys(disableTrackingProtectionPreferences)) {
      ffOptions.setPreference(pref, disableTrackingProtectionPreferences[pref]);
    }
  }

  if (options.debug) {
    ffOptions.addArguments('--devtools');
    // Mozilla use detach to make sure you can inspect the browser
    ffOptions.setPreference('detach', true);
  }

  if (!options.skipHar) {
    if (isAndroidConfigured(options)) {
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
        resolve(moduleRootPath, 'vendor', 'har_export_trigger-0.6.1-an+fx.xpi')
      );
    }
  }

  // Browsertime own extension, only load it when we need it
  // We should be able to only install it only when needed, but that could break scripting

  if (!firefoxConfig.disableBrowsertimeExtension) {
    ffOptions.addExtensions(
      resolve(moduleRootPath, 'vendor', 'browsertime-0.18.0-an+fx.xpi')
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

  const userPrefs = toArray(firefoxConfig.preference);
  log.debug('Set Firefox preference %j', userPrefs);
  for (const pref of userPrefs) {
    const name = pref.slice(0, Math.max(0, pref.indexOf(':')));
    let value = pref.slice(pref.indexOf(':') + 1);
    if (value === 'false') {
      ffOptions.setPreference(name, false);
    } else if (value === 'true') {
      ffOptions.setPreference(name, true);
      // eslint-disable-next-line unicorn/prefer-number-properties
    } else if (isNaN(value)) {
      ffOptions.setPreference(name, value);
    } else {
      ffOptions.setPreference(name, Number(value));
    }
  }

  let firefoxTypes = [
    get(firefoxConfig, 'binaryPath') ?? undefined,
    get(firefoxConfig, 'nightly') ? Channel.NIGHTLY : undefined,
    get(firefoxConfig, 'beta') ? Channel.BETA : undefined,
    get(firefoxConfig, 'developer') ? Channel.AURORA : undefined
  ];

  firefoxTypes = firefoxTypes.filter(function (n) {
    return n !== undefined;
  });

  // Do not set binary when using Android
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1751196

  if (!isAndroidConfigured(options)) {
    ffOptions.setBinary(
      firefoxTypes.length > 0 ? firefoxTypes[0] : Channel.RELEASE
    );
  }

  ffOptions.addArguments('-no-remote');

  if (firefoxConfig.args) {
    ffOptions.addArguments(firefoxConfig.args);
  }

  const environments = toArray(firefoxConfig.env);
  ffOptions.firefoxOptions_().env = ffOptions.firefoxOptions_().env || {};
  for (const environment of environments) {
    const name = environment.slice(0, Math.max(0, environment.indexOf('=')));
    const value = environment.slice(environment.indexOf('=') + 1);
    if (isAndroidConfigured(options)) {
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

  if (isAndroidConfigured(options)) {
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
      )
        // eslint-disable-next-line unicorn/prefer-spread
        .concat(...toArray(android.intentArgument));
    }
  }

  const proxyPacSettings = pick(options.proxy, ['pac']);

  if (!isEmpty(proxyPacSettings)) {
    builder.setProxy(pac(proxyPacSettings));
  }

  const proxySettings = pick(options.proxy, ['ftp', 'http', 'https', 'bypass']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(manual(proxySettings));
  }

  builder.setFirefoxOptions(ffOptions);
}
