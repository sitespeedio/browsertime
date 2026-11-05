import test from 'ava';

import { setupChromiumOptions } from '../../lib/chrome/webdriver/setupChromiumOptions.js';

function hostResolverRules(browserOptions) {
  const args = [];
  const seleniumOptions = {
    addArguments: arg => args.push(...[arg].flat()),
    setUserPreferences: () => {},
    setPerfLoggingPrefs: () => {},
    excludeSwitches: () => {}
  };
  setupChromiumOptions(seleniumOptions, browserOptions, {}, '/tmp');
  return args.find(arg => arg.startsWith('--host-resolver-rules='));
}

// Chromedriver starts Chrome without a shell, so quotes reach Chrome's rule
// parser and make it drop the first and the last rule.
test('WebPageReplay host resolver rules have no quotes', t => {
  const rules = hostResolverRules({
    webPageReplayHostResolver: true,
    webPageReplayHTTPPort: 8080,
    webPageReplayHTTPSPort: 8081
  });
  t.false(rules.includes('"'));
  t.true(rules.startsWith('--host-resolver-rules=MAP *:80 127.0.0.1:8080,'));
  t.true(rules.endsWith('EXCLUDE localhost'));
});

test('Default phone home host resolver rules have no quotes', t => {
  const rules = hostResolverRules({});
  t.false(rules.includes('"'));
  t.true(rules.startsWith('--host-resolver-rules=MAP '));
});

function mobileEmulation(browserOptions) {
  let emulation;
  const seleniumOptions = {
    addArguments: () => {},
    setUserPreferences: () => {},
    setPerfLoggingPrefs: () => {},
    excludeSwitches: () => {},
    setMobileEmulation: config => (emulation = config)
  };
  setupChromiumOptions(seleniumOptions, browserOptions, {}, '/tmp');
  return emulation;
}

// Chromedriver ignores width, height and pixelRatio outside deviceMetrics.
test('Mobile emulation width and height are sent as deviceMetrics', t => {
  t.deepEqual(
    mobileEmulation({
      mobileEmulation: { width: 360, height: 640, pixelRatio: 2 }
    }),
    { deviceMetrics: { width: 360, height: 640, pixelRatio: 2 } }
  );
});

test('Mobile emulation device name is sent unchanged', t => {
  t.deepEqual(mobileEmulation({ mobileEmulation: { deviceName: 'Pixel 7' } }), {
    deviceName: 'Pixel 7'
  });
});

function chromeArgs(browserOptions) {
  const args = [];
  const seleniumOptions = {
    addArguments: arg => args.push(...[arg].flat()),
    setUserPreferences: () => {},
    setPerfLoggingPrefs: () => {},
    excludeSwitches: () => {},
    androidPackage: () => {},
    androidChrome: () => {},
    androidDeviceSerial: () => {}
  };
  setupChromiumOptions(seleniumOptions, browserOptions, {}, '/tmp');
  return args;
}

// Without it Chrome on Android shows a command-line flags snackbar during the test.
test('Android Chrome gets --enable-test-intents, desktop does not', t => {
  t.true(
    chromeArgs({ android: { package: 'com.android.chrome' } }).includes(
      '--enable-test-intents'
    )
  );
  t.false(chromeArgs({}).includes('--enable-test-intents'));
});

function netLogArg(options) {
  const args = [];
  const seleniumOptions = {
    addArguments: arg => args.push(...[arg].flat()),
    setUserPreferences: () => {},
    setPerfLoggingPrefs: () => {},
    excludeSwitches: () => {},
    androidPackage: () => {},
    androidChrome: () => {},
    androidDeviceSerial: () => {}
  };
  setupChromiumOptions(
    seleniumOptions,
    { ...options.chrome, collectNetLog: true },
    options,
    '/tmp/result'
  );
  return args.find(arg => arg.startsWith('--log-net-log='));
}

// Chrome on the phone cannot write to the result folder on the computer.
test('The netlog goes to the phone on Android', t => {
  t.is(
    netLogArg({ android: { enabled: true }, chrome: { android: {} } }),
    '--log-net-log=/data/local/tmp/chromeNetlog.json'
  );
  t.is(
    netLogArg({ chrome: {} }),
    '--log-net-log=/tmp/result/chromeNetlog.json'
  );
});

function androidOptions(androidPackage) {
  const seleniumOptions = {
    options_: {},
    addArguments: () => {},
    setUserPreferences: () => {},
    setPerfLoggingPrefs: () => {},
    excludeSwitches: () => {},
    androidPackage(name) {
      this.options_.androidPackage = name;
    },
    androidActivity(name) {
      this.options_.androidActivity = name;
    },
    androidChrome: () => {},
    androidDeviceSerial: () => {}
  };
  setupChromiumOptions(
    seleniumOptions,
    { android: { package: androidPackage } },
    {},
    '/tmp'
  );
  return seleniumOptions.options_;
}

// Chromedriver only finds the DevTools socket of Chrome by itself.
test('Edge and Samsung Internet get the socket and exec name for Chromedriver', t => {
  t.like(androidOptions('com.microsoft.emmx'), {
    androidActivity: 'com.microsoft.ruby.Main',
    androidExecName: 'edge',
    androidDeviceSocket: 'chrome_devtools_remote',
    androidKeepAppDataDir: true
  });
  t.like(androidOptions('com.sec.android.app.sbrowser'), {
    androidActivity: '.SBrowserLauncherActivity',
    androidExecName: 'terrace',
    androidDeviceSocket: 'Terrace_devtools_remote',
    androidKeepAppDataDir: true
  });
  t.is(androidOptions('com.android.chrome').androidDeviceSocket, undefined);
});
