import test from 'ava';
import { Android, getAndroidBrowserPackage } from '../../lib/android/index.js';

function focusedWindow(dumpsysLine) {
  return Android.prototype.getFocusedWindow.call({
    _runCommandAndGet: async () => dumpsysLine
  });
}

test('Get the focused window from dumpsys', async t => {
  t.is(
    await focusedWindow(
      '  mCurrentFocus=Window{b50184f u0 com.android.chrome/org.chromium.chrome.browser.ChromeTabbedActivity}'
    ),
    'com.android.chrome/org.chromium.chrome.browser.ChromeTabbedActivity'
  );
  // A work profile or a second user has another user id.
  t.is(
    await focusedWindow(
      '  mCurrentFocus=Window{1a2b u10 org.mozilla.firefox/org.mozilla.fenix.HomeActivity}'
    ),
    'org.mozilla.firefox/org.mozilla.fenix.HomeActivity'
  );
  t.is(await focusedWindow('  mCurrentFocus=null'), 'null');
});

test('Get the package of the browser on the phone', t => {
  t.is(getAndroidBrowserPackage({ browser: 'chrome' }), 'com.android.chrome');
  t.is(getAndroidBrowserPackage({ browser: 'firefox' }), 'org.mozilla.firefox');
  t.is(
    getAndroidBrowserPackage({
      browser: 'chrome',
      chrome: { android: { package: 'com.chrome.dev' } }
    }),
    'com.chrome.dev'
  );
});
