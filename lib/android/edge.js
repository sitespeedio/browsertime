import { getLogger } from '@sitespeed.io/log';
import { Android } from './index.js';
const log = getLogger('browsertime.android');
const delay = ms => new Promise(res => setTimeout(res, ms));

const EDGE_PACKAGE = 'com.microsoft.emmx';
// The port is not safe, so Edge shows an error page at once and does not use
// the network.
const FIRST_URL = 'http://127.0.0.1:1/';

/**
 * Edge on Android needs more than Chromedriver gives it to start with no data.
 * Chromedriver clears the data and starts Edge without a URL. Edge then shows
 * its new tab page on top of the tab, and does not paint the page that we
 * measure in that tab. Clearing the data also removes the notification
 * permission, and Edge asks for it on top of the page. Browsertime therefore
 * clears the data, gives the permission and opens a page once, so Edge saves a
 * normal tab. Chromedriver keeps that data and Edge opens that tab when it
 * starts.
 */
export class AndroidEdge {
  static isConfigured(browserOptions) {
    return browserOptions.android?.package === EDGE_PACKAGE;
  }

  constructor(options) {
    this.android = new Android(options);
  }

  async startWithCleanProfile() {
    log.info('Clear the data of Edge and open it once');
    const run = command => this.android._runCommand(command);
    await run(`am force-stop ${EDGE_PACKAGE}`);
    await run(`pm clear ${EDGE_PACKAGE}`);
    await run(`pm grant ${EDGE_PACKAGE} android.permission.POST_NOTIFICATIONS`);
    // Edge reads the flags file, with --disable-fre, only as the debug app.
    await run(`am set-debug-app --persistent ${EDGE_PACKAGE}`);
    await run(
      `am start -W -a android.intent.action.VIEW -p ${EDGE_PACKAGE} -d ${FIRST_URL}`
    );
    // The first start can take more time than am start waits, and Edge can
    // show other activities before the tab.
    const end = Date.now() + 30_000;
    for (;;) {
      const window = await this.android.getFocusedWindow();
      if (window.includes('ChromeTabbedActivity')) {
        break;
      }
      if (Date.now() > end) {
        log.info(
          'Edge did not show the tab, the page can be hidden in the test'
        );
        break;
      }
      await delay(500);
    }
    await delay(2000);
    // Edge saves its tabs when it goes to the background.
    await this.android.pressHomeButton();
    await delay(2000);
    await run(`am force-stop ${EDGE_PACKAGE}`);
  }
}
