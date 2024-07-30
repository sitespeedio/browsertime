// See https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md
// https://peter.sh/experiments/chromium-command-line-switches/
export const chromeDesktopOptions = [
  '--allow-running-insecure-content',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-fetching-hints-at-navigation-start',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-search-engine-choice-screen',
  '--disable-site-isolation-trials',
  '--disable-sync',
  '--metrics-recording-only',
  '--mute-audio',
  '--new-window',
  '--no-default-browser-check',
  '--no-first-run',
  '--password-store=basic',
  '--use-mock-keychain'
];
