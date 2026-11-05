import { readFileSync } from 'node:fs';
import { getLogger } from '@sitespeed.io/log';
import { chromeDesktopOptions as defaultChromeOptions } from '../settings/chromeDesktopOptions.js';
import { chromeAndroidOptions as defaultAndroidChromeOptions } from '../settings/chromeAndroidOptions.js';
import { getViewPort } from '../../support/getViewPort.js';
import { toArray } from '../../support/util.js';
import { isAndroidConfigured, Android } from '../../android/index.js';
const log = getLogger('browsertime.chrome');

// Chromedriver only knows Chrome by its package name. For other Chromium
// browsers on Android it needs the name of the DevTools socket, and the
// browser reads its flags from its own file. keepAppData: the browser shows a
// welcome screen after its data is cleared, so we keep the data and clear the
// cache and cookies instead.
const OTHER_ANDROID_BROWSERS = {
  'com.microsoft.emmx': {
    activity: 'com.microsoft.ruby.Main',
    execName: 'edge',
    socket: 'chrome_devtools_remote',
    commandLineFile: 'chrome-command-line',
    keepAppData: true
  },
  'com.sec.android.app.sbrowser': {
    activity: '.SBrowserLauncherActivity',
    execName: 'terrace',
    socket: 'Terrace_devtools_remote',
    commandLineFile: 'terrace-command-line',
    keepAppData: true
  }
};
// Chromedriver adds these to the Chrome flags on Android.
const CHROMEDRIVER_ANDROID_ARGS = [
  '--allow-pre-commit-input',
  '--disable-backgrounding-occluded-windows',
  '--disable-popup-blocking'
];

const CHROME_AMD_EDGE_INTERNAL_PHONE_HOME = [
  'MAP cache.pack.google.com ^NOTFOUND',
  'MAP clients1.google.com ^NOTFOUND',
  'MAP mtalk.google.com ^NOTFOUND',
  'MAP update.googleapis.com ^NOTFOUND',
  'MAP content-autofill.googleapis.com ^NOTFOUND',
  'MAP redirector.gvt1.com ^NOTFOUND',
  'MAP laptop-updates.brave.com ^NOTFOUND',
  'MAP offlinepages-pa.googleapis.com ^NOTFOUND',
  'MAP edge.microsoft.com ^NOTFOUND',
  'MAP optimizationguide-pa.googleapis.com ^NOTFOUND'
];

const CHROME_FEATURES_THAT_WE_ENABLE = ['SoftNavigationHeuristics'];

const CHROME_FEATURES_THAT_WE_DISABLES = [
  'AutofillServerCommunication',
  'CalculateNativeWinOcclusion',
  'ChromeWhatsNewUI',
  'HeavyAdPrivacyMitigations',
  'InterestFeedContentSuggestions',
  'MediaRouter',
  'NetworkTimeServiceQuerying',
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
  // Record every argument / preference / capability we apply to the browser
  // so it can be surfaced in the result JSON for debugging — issue #1622.
  // Stored on `options` because both Chrome and Edge call this and both end
  // up needing it later in the engine for `result.info.browser`.
  const recorded = {
    args: [],
    preferences: {},
    mobileEmulation: undefined,
    binaryPath: undefined,
    extensions: 0
  };
  options.recordedBrowserSettings = recorded;

  const addArgs = arg => {
    seleniumOptions.addArguments(arg);
    if (Array.isArray(arg)) {
      recorded.args.push(...arg);
    } else {
      recorded.args.push(arg);
    }
  };
  const setPrefs = prefs => {
    seleniumOptions.setUserPreferences(prefs);
    Object.assign(recorded.preferences, prefs);
  };

  // Fixing save password popup, only on Desktop

  if (!isAndroidConfigured(options)) {
    setPrefs({
      'profile.password_manager_enable': false,
      'profile.default_content_setting_values.notifications': 2,
      credentials_enable_service: false
    });
  }

  if (options.headless) {
    addArgs('--headless=new');
  }

  // If we run in Docker we need to always use no-sandbox
  if (options.docker) {
    addArgs('--no-sandbox');
    addArgs('--disable-setuid-sandbox');
  }

  if (options.xvfb && (options.xvfb === true || options.xvfb === 'true')) {
    addArgs('--disable-gpu');
  }

  addArgs('--disable-features=' + CHROME_FEATURES_THAT_WE_DISABLES.join(','));

  addArgs('--enable-features=' + CHROME_FEATURES_THAT_WE_ENABLE.join(','));

  const viewPort = getViewPort(options);
  // If viewport is defined (only on desktop) then set start args
  if (viewPort) {
    addArgs('--window-position=0,0');
    addArgs('--window-size=' + viewPort.replace('x', ','));

    // Desktop Chrome enforces a minimum window width (~500px) regardless of
    // --window-size, so a request like --viewPort 360x640 silently becomes
    // 500x640. The video and filmstrips are still cropped to the requested
    // size, which is why they look chopped. Mobile emulation is the supported
    // way to test smaller viewports — it tells the renderer to lay out at
    // the requested size while the OS window can stay desktop-sized.
    // See https://github.com/sitespeedio/browsertime/issues/1222
    const usingEmulation =
      browserOptions.mobileEmulation &&
      (browserOptions.mobileEmulation.deviceName ||
        (browserOptions.mobileEmulation.width &&
          browserOptions.mobileEmulation.height));
    if (!usingEmulation) {
      const [w] = viewPort.split('x').map(Number);
      if (w && w < 500) {
        log.warn(
          'Requested viewport %s — desktop Chrome enforces a minimum window width of about 500px and will silently use a wider window. The video, filmstrip and screenshots will be cropped because they are sized to the requested viewport. To test smaller viewports, use Chrome mobile emulation: --chrome.mobileEmulation.deviceName "iPhone 12 Pro" (or set --chrome.mobileEmulation.width, --chrome.mobileEmulation.height and --chrome.mobileEmulation.pixelRatio).',
          viewPort
        );
      }
    }
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

    addArgs('--host-resolver-rules=' + excludes);
  } // If we are replaying with WebPageReplay
  else if (browserOptions.webPageReplayHostResolver) {
    addArgs(
      `--host-resolver-rules=MAP *:80 127.0.0.1:${browserOptions.webPageReplayHTTPPort},  MAP *:443 127.0.0.1:${browserOptions.webPageReplayHTTPSPort}, MAP mtalk.google.com ^NOTFOUND, EXCLUDE localhost`
    );
  } // If we do not use WebPageReplay but wanna block on domain
  else if (browserOptions.blockDomainsExcept) {
    let excludes = '';
    let excludesDomains = toArray(browserOptions.blockDomainsExcept);
    for (let domain of excludesDomains) {
      excludes += 'MAP * 127.0.0.1, EXCLUDE ' + domain + ',';
    }
    addArgs('--host-resolver-rules=' + excludes);
  } else {
    // Make sure we only set this if we do not have any other host resolver rules
    const chromeCommandLineArguments = toArray(browserOptions.args);
    const argumentsWithHostResolverRules = chromeCommandLineArguments.filter(
      argument => argument.includes('host-resolver-rules')
    );
    if (argumentsWithHostResolverRules.length === 0) {
      addArgs(
        `--host-resolver-rules=${CHROME_AMD_EDGE_INTERNAL_PHONE_HOME.join(',')}`
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
      recorded.extensions += 1;
    }
  }

  if (options.debug) {
    addArgs('--auto-open-devtools-for-tabs');
  }

  const perfLogConfig = { enableNetwork: true, enablePage: true };
  seleniumOptions.setPerfLoggingPrefs(perfLogConfig);

  if (options.userAgent) {
    addArgs('--user-agent=' + options.userAgent);
  }

  if (browserOptions.ignoreCertificateErrors) {
    addArgs('--ignore-certificate-errors');
  }

  if (browserOptions.collectNetLog) {
    const dir = isAndroidConfigured(options) ? '/data/local/tmp' : baseDir;
    addArgs(`--log-net-log=${dir}/chromeNetlog.json`);
    const level = browserOptions.netLogCaptureMode || 'IncludeSensitive';
    addArgs(`--net-log-capture-mode=${level}`);
  }

  if (browserOptions.android) {
    addArgs(defaultAndroidChromeOptions);
    addArgs('--remote-debugging-port=' + options.devToolsPort);
  } else {
    if (browserOptions.noDefaultOptions) {
      log.info('Skip setting default options for Chrome');
    } else {
      addArgs(defaultChromeOptions);
      addArgs('--remote-debugging-port=' + options.devToolsPort);
    }
  }

  if (browserOptions.enableVideoAutoplay) {
    addArgs('--autoplay-policy=no-user-gesture-required');
  }

  // It's a new splash screen introduced in Chrome 98
  // for new profiles
  // disable it with ChromeWhatsNewUI
  if (browserOptions.args) {
    const chromeCommandLineArguments = toArray(browserOptions.args);
    for (const argument of chromeCommandLineArguments) {
      // Chrome is last-wins for duplicated switches, so a user supplied
      // disable-features/enable-features argument would silently replace
      // the built-in lists added above. Merge them instead.
      if (argument.includes('disable-features')) {
        const merged = `${argument},${CHROME_FEATURES_THAT_WE_DISABLES.join(',')}`;
        addArgs(merged);
        log.debug('Set Chrome args %j', merged);
      } else if (argument.includes('enable-features')) {
        const merged = `${argument},${CHROME_FEATURES_THAT_WE_ENABLE.join(',')}`;
        addArgs(merged);
        log.debug('Set Chrome args %j', merged);
      } else {
        addArgs(argument);
        log.debug('Set Chrome args %j', argument);
      }
    }
  }

  if (browserOptions.binaryPath) {
    seleniumOptions.setChromeBinaryPath(browserOptions.binaryPath);
    recorded.binaryPath = browserOptions.binaryPath;
  }

  if (browserOptions.mobileEmulation) {
    const { width, height, pixelRatio, ...rest } =
      browserOptions.mobileEmulation;
    // Chromedriver ignores width, height and pixelRatio unless they are
    // in deviceMetrics.
    const mobileEmulation =
      width && height
        ? { ...rest, deviceMetrics: { width, height, pixelRatio } }
        : browserOptions.mobileEmulation;
    seleniumOptions.setMobileEmulation(mobileEmulation);
    recorded.mobileEmulation = mobileEmulation;
  }

  // See https://bugs.chromium.org/p/chromium/issues/detail?id=818483
  // Coming again in Chrome 76
  seleniumOptions.excludeSwitches('enable-automation');

  const android = browserOptions.android;
  if (android) {
    // Chrome on Android shows a snackbar "Chrome is loading flags from a
    // command-line file" during the test, except with --enable-automation
    // (removed above) or --enable-test-intents.
    addArgs('--enable-test-intents');
    if (android.package) {
      seleniumOptions.androidPackage(android.package);
      const otherBrowser = OTHER_ANDROID_BROWSERS[android.package];
      if (otherBrowser) {
        // Chromedriver writes the flags to a file that the browser does not
        // read, see writeAndroidCommandLine.
        seleniumOptions.options_.androidExecName = otherBrowser.execName;
        seleniumOptions.options_.androidDeviceSocket = otherBrowser.socket;
        seleniumOptions.options_.androidKeepAppDataDir =
          otherBrowser.keepAppData;
        if (!android.activity) {
          seleniumOptions.androidActivity(otherBrowser.activity);
        }
      }
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

/**
 * Write the Chrome flags to the file that a Chromium browser that is not
 * Chrome reads on Android, with the same quoting as Chromedriver.
 */
export async function writeAndroidCommandLine(browserOptions, options) {
  const otherBrowser = OTHER_ANDROID_BROWSERS[browserOptions.android?.package];
  if (!otherBrowser) {
    return;
  }
  const args = [
    ...CHROMEDRIVER_ANDROID_ARGS,
    ...options.recordedBrowserSettings.args
  ].map(arg => {
    const index = arg.indexOf('=');
    return index > 0 && /\s/.test(arg)
      ? `${arg.slice(0, index + 1)}"${arg.slice(index + 1)}"`
      : arg;
  });
  return new Android(options).writeCommandLineFile(
    otherBrowser.commandLineFile,
    `_ ${args.join(' ')}\n`
  );
}

export function getAndroidDevtoolsSocket(browserOptions) {
  return (
    OTHER_ANDROID_BROWSERS[browserOptions.android?.package]?.socket ??
    'chrome_devtools_remote'
  );
}

export function keepsAndroidAppData(browserOptions) {
  return Boolean(
    OTHER_ANDROID_BROWSERS[browserOptions.android?.package]?.keepAppData
  );
}
