const fs = require('fs');
const defaultChromeOptions = require('../settings/chromeDesktopOptions');
const defaultAndroidChromeOptions = require('../settings/chromeAndroidOptions');
const getViewPort = require('../../support/getViewPort');
const util = require('../../support/util');

module.exports = function(seleniumOptions, browserOptions, options, baseDir) {
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
    seleniumOptions.addArguments(defaultChromeOptions);
  }

  if (browserOptions.args) {
    seleniumOptions.addArguments(browserOptions.args);
  }

  if (browserOptions.binaryPath) {
    seleniumOptions.setChromeBinaryPath(browserOptions.binaryPath);
  }

  if (browserOptions.mobileEmulation) {
    seleniumOptions.setMobileEmulation(browserOptions.mobileEmulation);
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
      seleniumOptions.addArguments(
        '--proxy-server=socks5://localhost:' + connectivity.tsproxy.port
      );
      seleniumOptions.addArguments(
        '--host-resolver-rules="MAP * ~NOTFOUND , EXCLUDE localhost"'
      );
    } else {
      // If you run on Android and want to use TSProxy on your desktop
      seleniumOptions.addArguments(
        '--proxy-server=socks://' +
          connectivity.tsproxy.bind +
          ':' +
          connectivity.tsproxy.port
      );
    }
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

  return seleniumOptions;
};
