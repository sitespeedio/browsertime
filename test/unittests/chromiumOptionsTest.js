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
