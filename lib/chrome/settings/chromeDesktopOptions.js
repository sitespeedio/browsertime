'use strict';

// See https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md
// https://peter.sh/experiments/chromium-command-line-switches/
module.exports = [
  '--disable-background-networking',
  '--no-default-browser-check',
  '--no-first-run',
  '--new-window',
  '--allow-running-insecure-content',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-device-discovery-notifications',
  '--disable-domain-reliability',
  '--disable-background-timer-throttling',
  '--load-media-router-component-extension=0',
  '--mute-audio',
  '--disable-hang-monitor',
  '--password-store=basic',
  '--disable-breakpad',
  '--dont-require-litepage-redirect-infobar',
  '--override-https-image-compression-infobar',
  '--disable-fetching-hints-at-navigation-start',
  '--disable-dev-shm-usage',
  '--disable-back-forward-cache',
  '--disable-site-isolation-trials',
  '--remote-debugging-port=9222'
];
