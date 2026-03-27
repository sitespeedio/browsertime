import { getLogger } from '@sitespeed.io/log';
import { lcpHighlightScript as highlightLargestContentfulPaint } from '../util/lcpHighlightScript.js';
import { clsHighlightScript as highlightLS } from '../util/lsHighlightScript.js';
const log = getLogger('browsertime.command.measure');

/**
 * Handles screenshot capture during measurement collection.
 * @class
 * @private
 */
export class MeasureScreenshots {
  constructor(browser, screenshotManager, options) {
    this.browser = browser;
    this.screenshotManager = screenshotManager;
    this.options = options;
  }

  async afterPageCompleteCheck(url, index) {
    if (!this.options.screenshot) {
      return;
    }
    log.info('Take after page complete check screenshot');
    try {
      const screenshot = await this.browser.takeScreenshot(url);
      await this.screenshotManager.save(
        'afterPageCompleteCheck',
        screenshot,
        url,
        index
      );
    } catch {
      // not getting screenshots shouldn't result in a failed test.
    }
  }

  async layoutShift(url, index) {
    if (!this.options.screenshotLS) {
      return;
    }

    const supportLS = await this.browser.runScript(
      `
      const supported = PerformanceObserver.supportedEntryTypes;
      if (!supported || supported.indexOf('layout-shift') === -1) {
        return false;
      } else return true;
      `,
      'SUPPORT_LS'
    );

    if (!supportLS) {
      return;
    }

    log.info('Take cumulative layout shift screenshot');
    await this.browser.runScript(highlightLS, 'HIGHLIGHT_LS', {
      color: this.options.screenshotLSColor || 'red',
      limit: this.options.screenshotLSLimit || 0.01
    });
    const screenshot = await this.browser.takeScreenshot(url);
    await this.screenshotManager.save('layoutShift', screenshot, url, index);
    const lsScriptClean = `
        const c = document.getElementById("browsertime-ls");
        if (c) c.remove();
      `;
    await this.browser.runScript(lsScriptClean, 'CLEAN_LS');
  }

  async largestContentfulPaint(url, index) {
    if (!this.options.screenshotLCP) {
      return;
    }

    const supportLCP = await this.browser.runScript(
      `
      const supported = PerformanceObserver.supportedEntryTypes;
      if (!supported || supported.indexOf('largest-contentful-paint') === -1) {
        return false;
      } else return true;
      `,
      'SUPPORT_LCP'
    );

    if (!supportLCP) {
      return;
    }

    log.info('Take largest contentful paint screenshot');
    try {
      const lcpScriptClean = `
        const c = document.getElementById("browsertime-lcp");
        if (c) c.remove();
      `;
      const message = await this.browser.runScript(
        highlightLargestContentfulPaint,
        'HIGHLIGHT_LCP',
        this.options.screenshotLCPColor || 'red'
      );
      if (message != '') {
        log.info(message);
      }
      const screenshot = await this.browser.takeScreenshot(url);
      await this.screenshotManager.save(
        'largestContentfulPaint',
        screenshot,
        url,
        index
      );
      await this.browser.runScript(lcpScriptClean, 'CLEAN_LCP');
    } catch (error) {
      log.error('Could not get LCP screenshot', error);
    }
  }
}
