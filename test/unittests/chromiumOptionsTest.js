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
