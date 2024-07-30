/**
 * Options when we run Chrome on Android
 * see https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md
 * https://peter.sh/experiments/chromium-command-line-switches/
 */
export const chromeAndroidOptions = [
  '--disable-fre',
  // : Disable reporting to UMA, but allows for collection
  '--metrics-recording-only',
  '--disable-background-networking',
  '--disable-component-update',
  '--no-default-browser-check',
  '--no-first-run',
  '--allow-running-insecure-content',
  '--disable-client-side-phishing-detection',
  '--disable-device-discovery-notifications',
  '--disable-default-apps',
  '--disable-domain-reliability',
  '--disable-background-timer-throttling',
  '--disable-external-intent-requests',
  '--disable-search-engine-choice-screen',
  '--enable-remote-debugging',
  '--mute-audio',
  '--disable-hang-monitor',
  '--password-store=basic',
  '--disable-breakpad',
  '--dont-require-litepage-redirect-infobar',
  '--override-https-image-compression-infobar',
  '--disable-fetching-hints-at-navigation-start'
];
