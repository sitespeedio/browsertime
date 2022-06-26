const fs = require('fs');
const defaultChromeOptions = require('../settings/chromeDesktopOptions');
const defaultAndroidChromeOptions = require('../settings/chromeAndroidOptions');
const getViewPort = require('../../support/getViewPort');
const util = require('../../support/util');
const log = require('intel').getLogger('browsertime.chrome');

const CHROME_AMD_EDGE_INTERNAL_PHONE_HOME = [
  '"MAP cache.pack.google.com 127.0.0.1"',
  '"MAP clients1.google.com 127.0.0.1"',
  '"MAP update.googleapis.com 127.0.0.1"',
  '"MAP redirector.gvt1.com 127.0.0.1"',
  '"MAP laptop-updates.brave.com 127.0.0.1"',
  '"MAP offlinepages-pa.googleapis.com 127.0.0.1"',
  '"MAP edge.microsoft.com 127.0.0.1"',
  '"MAP optimizationguide-pa.googleapis.com 127.0.0.1"'
];

module.exports = function (seleniumOptions, browserOptions, options, baseDir) {
  // Fixing save password popup, only on Desktop
  if (!options.android) {
    seleniumOptions.setUserPreferences({
      'profile.password_manager_enable': false,
      'profile.default_content_setting_values.notifications': 2,
      credentials_enable_service: false
    });
  }

  if (options.headless) {
    seleniumOptions.headless();
  }

  // If we run in Docker we need to always use no-sandbox
  if (options.docker) {
    seleniumOptions.addArguments('--no-sandbox');
    seleniumOptions.addArguments('--disable-setuid-sandbox');
  }

  if (options.xvfb && (options.xvfb === true || options.xvfb === 'true')) {
    seleniumOptions.addArguments('--disable-gpu');
  }

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
    const firstPartyDomains = util.toArray(browserOptions.blockDomainsExcept);
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
    let excludesDomains = util.toArray(browserOptions.blockDomainsExcept);
    for (let domain of excludesDomains) {
      excludes += 'MAP * 127.0.0.1, EXCLUDE ' + domain + ',';
    }
    seleniumOptions.addArguments('--host-resolver-rules=' + excludes);
  } else {
    // Make sure we only set this if we do not have any other host resolver rules
    const chromeCommandLineArgs = util.toArray(browserOptions.args);
    const argsWithHostResolverRules = chromeCommandLineArgs.filter(arg =>
      arg.includes('host-resolver-rules')
    );
    if (argsWithHostResolverRules.length === 0) {
      seleniumOptions.addArguments(
        '--host-resolver-rules=' + CHROME_AMD_EDGE_INTERNAL_PHONE_HOME.join(',')
      );
    }
  }

  if (options.extension) {
    const extensions = !Array.isArray(options.extension)
      ? [options.extension]
      : options.extension;
    for (const extension of extensions) {
      seleniumOptions.addExtensions(
        fs.readFileSync(extension, { encoding: 'base64' })
      );
    }
  }

  if (options.debug) {
    seleniumOptions.addArguments('--auto-open-devtools-for-tabs');
  }

  const perfLogConf = { enableNetwork: true, enablePage: true };
  seleniumOptions.setPerfLoggingPrefs(perfLogConf);

  if (options.userAgent) {
    seleniumOptions.addArguments('--user-agent=' + options.userAgent);
  }

  if (browserOptions.ignoreCertificateErrors) {
    seleniumOptions.addArguments('--ignore-certificate-errors');
  }

  if (browserOptions.collectNetLog) {
    const dir = !browserOptions.android ? baseDir : '/data/local/tmp';
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
    if (!browserOptions.noDefaultOptions) {
      seleniumOptions.addArguments(defaultChromeOptions);
      seleniumOptions.addArguments(
        '--remote-debugging-port=' + options.devToolsPort
      );
    } else {
      log.info('Skip setting default options for Chrome');
    }
  }

  // It's a new splash screen introduced in Chrome 98
  // for new profiles
  // disable it with ChromeWhatsNewUI
  if (browserOptions.args) {
    const chromeCommandLineArgs = util.toArray(browserOptions.args);
    for (const arg of chromeCommandLineArgs) {
      if (
        arg.indexOf('disable-features') > -1 &&
        arg.indexOf('ChromeWhatsNewUI') === -1
      ) {
        seleniumOptions.addArguments(`${arg},ChromeWhatsNewUI`);
        log.debug('Set Chrome args %j', `${arg},ChromeWhatsNewUI`);
      } else {
        seleniumOptions.addArguments(arg);
        log.debug('Set Chrome args %j', arg);
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
};
