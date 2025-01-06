import { readFileSync } from 'node:fs';
import { getLogger } from '@sitespeed.io/log';
import { chromeDesktopOptions as defaultChromeOptions } from '../settings/chromeDesktopOptions.js';
import { chromeAndroidOptions as defaultAndroidChromeOptions } from '../settings/chromeAndroidOptions.js';
import { getViewPort } from '../../support/getViewPort.js';
import { toArray } from '../../support/util.js';
import { isAndroidConfigured } from '../../android/index.js';
const log = getLogger('browsertime.chrome');

const CHROME_AMD_EDGE_INTERNAL_PHONE_HOME = [
  'MAP cache.pack.google.com 127.0.0.1',
  'MAP clients1.google.com 127.0.0.1',
  'MAP update.googleapis.com 127.0.0.1',
  'MAP content-autofill.googleapis.com 127.0.0.1',
  'MAP redirector.gvt1.com 127.0.0.1',
  'MAP laptop-updates.brave.com 127.0.0.1',
  'MAP offlinepages-pa.googleapis.com 127.0.0.1',
  'MAP edge.microsoft.com 127.0.0.1',
  'MAP optimizationguide-pa.googleapis.com 127.0.0.1'
];

const CHROME_FEATURES_THAT_WE_DISABLES = [
  'AutofillServerCommunication',
  'CalculateNativeWinOcclusion',
  'HeavyAdPrivacyMitigations',
  'InterestFeedContentSuggestions',
  'MediaRouter',
  'OfflinePagesPrefetching',
  'OptimizationHints',
  'SidePanelPinning',
  'Translate',
  'msAutofillEdgeCoupons',
  'msShoppingTrigger',
  'msEdgeShoppingUI',
  'msEntityExtraction',
  'msEntityExtractionProactive',
  'msWebAssist'
];

export function setupChromiumOptions(
  seleniumOptions,
  browserOptions,
  options,
  baseDir
) {
  // Fixing save password popup, only on Desktop

  if (!isAndroidConfigured(options)) {
    seleniumOptions.setUserPreferences({
      'profile.password_manager_enable': false,
      'profile.default_content_setting_values.notifications': 2,
      credentials_enable_service: false
    });
  }

  if (options.headless) {
    seleniumOptions.addArguments('--headless=new');
  }

  // If we run in Docker we need to always use no-sandbox
  if (options.docker) {
    seleniumOptions.addArguments('--no-sandbox');
    seleniumOptions.addArguments('--disable-setuid-sandbox');
  }

  if (options.xvfb && (options.xvfb === true || options.xvfb === 'true')) {
    seleniumOptions.addArguments('--disable-gpu');
  }

  seleniumOptions.addArguments(
    '--disable-features=' + CHROME_FEATURES_THAT_WE_DISABLES.join(',')
  );

  const viewPort = getViewPort(options);
  // If viewport is defined (only on desktop) then set start args
  if (viewPort) {
    seleniumOptions.addArguments('--window-position=0,0');
    seleniumOptions.addArguments('--window-size=' + viewPort.replace('x', ','));
  }

  // If we are recording responses and we also block on domain
  if (
    browserOptions.blockDomainsExcept &&
    browserOptions.webPageReplayHostResolver &&
    browserOptions.webPageReplayRecord
  ) {
    const firstPartyDomains = toArray(browserOptions.blockDomainsExcept);
    let excludes = '';
    for (let domain of firstPartyDomains) {
      excludes += ` MAP ${domain}:80 127.0.0.1:${browserOptions.webPageReplayHTTPPort},`;
      excludes += ` MAP ${domain}:443 127.0.0.1:${browserOptions.webPageReplayHTTPSPort},`;
    }
    excludes += ' EXCLUDE localhost';

    seleniumOptions.addArguments('--host-resolver-rules=' + excludes);
  } // If we are replaying with WebPageReplay
  else if (browserOptions.webPageReplayHostResolver) {
    seleniumOptions.addArguments(
      `--host-resolver-rules= "MAP *:80 127.0.0.1:${browserOptions.webPageReplayHTTPPort},  MAP *:443 127.0.0.1:${browserOptions.webPageReplayHTTPSPort}, EXCLUDE localhost"`
    );
  } // If we do not use WebPageReplay but wanna block on domain
  else if (browserOptions.blockDomainsExcept) {
    let excludes = '';
    let excludesDomains = toArray(browserOptions.blockDomainsExcept);
    for (let domain of excludesDomains) {
      excludes += 'MAP * 127.0.0.1, EXCLUDE ' + domain + ',';
    }
    seleniumOptions.addArguments('--host-resolver-rules=' + excludes);
  } else {
    // Make sure we only set this if we do not have any other host resolver rules
    const chromeCommandLineArguments = toArray(browserOptions.args);
    const argumentsWithHostResolverRules = chromeCommandLineArguments.filter(
      argument => argument.includes('host-resolver-rules')
    );
    if (argumentsWithHostResolverRules.length === 0) {
      seleniumOptions.addArguments(
        `--host-resolver-rules="${CHROME_AMD_EDGE_INTERNAL_PHONE_HOME.join(
          ','
        )}"`
      );
    }
  }

  if (options.extension) {
    const extensions = Array.isArray(options.extension)
      ? options.extension
      : [options.extension];
    for (const extension of extensions) {
      seleniumOptions.addExtensions(
        readFileSync(extension, { encoding: 'base64' })
      );
    }
  }

  if (options.debug) {
    seleniumOptions.addArguments('--auto-open-devtools-for-tabs');
  }

  const perfLogConfig = { enableNetwork: true, enablePage: true };
  seleniumOptions.setPerfLoggingPrefs(perfLogConfig);

  if (options.userAgent) {
    seleniumOptions.addArguments('--user-agent=' + options.userAgent);
  }

  if (browserOptions.ignoreCertificateErrors) {
    seleniumOptions.addArguments('--ignore-certificate-errors');
  }

  if (browserOptions.collectNetLog) {
    const dir = isAndroidConfigured(browserOptions)
      ? '/data/local/tmp'
      : baseDir;
    seleniumOptions.addArguments(`--log-net-log=${dir}/chromeNetlog.json`);
    const level = browserOptions.netLogCaptureMode || 'IncludeSensitive';
    seleniumOptions.addArguments(`--net-log-capture-mode=${level}`);
  }

  if (browserOptions.android) {
    seleniumOptions.addArguments(defaultAndroidChromeOptions);
    seleniumOptions.addArguments(
      '--remote-debugging-port=' + options.devToolsPort
    );
  } else {
    if (browserOptions.noDefaultOptions) {
      log.info('Skip setting default options for Chrome');
    } else {
      seleniumOptions.addArguments(defaultChromeOptions);
      seleniumOptions.addArguments(
        '--remote-debugging-port=' + options.devToolsPort
      );
    }
  }

  if (browserOptions.enableVideoAutoplay) {
    seleniumOptions.addArguments('--autoplay-policy=no-user-gesture-required');
  }

  // It's a new splash screen introduced in Chrome 98
  // for new profiles
  // disable it with ChromeWhatsNewUI
  if (browserOptions.args) {
    const chromeCommandLineArguments = toArray(browserOptions.args);
    for (const argument of chromeCommandLineArguments) {
      if (
        argument.includes('disable-features') &&
        !argument.includes('ChromeWhatsNewUI')
      ) {
        seleniumOptions.addArguments(`${argument},ChromeWhatsNewUI`);
        log.debug('Set Chrome args %j', `${argument},ChromeWhatsNewUI`);
      } else {
        seleniumOptions.addArguments(argument);
        log.debug('Set Chrome args %j', argument);
      }
    }
  } else {
    seleniumOptions.addArguments('--disable-features=ChromeWhatsNewUI');
  }

  if (browserOptions.binaryPath) {
    seleniumOptions.setChromeBinaryPath(browserOptions.binaryPath);
  }

  if (browserOptions.mobileEmulation) {
    seleniumOptions.setMobileEmulation(browserOptions.mobileEmulation);
  }

  // See https://bugs.chromium.org/p/chromium/issues/detail?id=818483
  // Coming again in Chrome 76
  seleniumOptions.excludeSwitches('enable-automation');

  const android = browserOptions.android;
  if (android) {
    if (android.package) {
      seleniumOptions.androidPackage(android.package);
      if (android.activity) {
        seleniumOptions.androidActivity(android.activity);
        if (android.process) {
          seleniumOptions.androidProcess(android.process);
        }
      }
    } else {
      seleniumOptions.androidChrome();
    }
    seleniumOptions.androidDeviceSerial(android.deviceSerial);
  }

  log.debug('Setting the following Selenium options: %j', seleniumOptions);
  return seleniumOptions;
}
