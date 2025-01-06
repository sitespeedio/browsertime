import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime');
const delay = ms => new Promise(res => setTimeout(res, ms));

export async function preURL(browser, options) {
  log.info('Accessing preURL %s', options.preURL);
  await browser.loadAndWait(options.preURL);
  if (!options.preURLDisableWhiteBackground) {
    await browser.runScript(
      'document.body.innerHTML = ""; document.body.style.backgroundColor = "white";',
      'WHITE_BACKGROUND'
    );
  }

  return delay(options.preURLDelay ?? 1500);
}
