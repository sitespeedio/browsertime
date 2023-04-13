export class GeckoProfiler {
  constructor(GeckoProfiler, browser, index, options) {
    this.GeckoProfiler = GeckoProfiler;
    this.browser = browser;
    this.index = index;
    this.options = options;
  }

  async start() {
    if (
      this.browserName === 'firefox' &&
      this.options.firefox.geckoProfilerRecordingType === 'custom'
    ) {
      return this.GeckoProfiler.start();
    } else {
      throw new Error('Geckoprofiler only works in Firefox');
    }
  }

  async stop() {
    if (
      this.browserName === 'firefox' &&
      this.options.firefox.geckoProfilerRecordingType === 'custom'
    ) {
      const url = await this.browser
        .getDriver()
        .executeScript('return document.documentURI;');

      return this.GeckoProfiler.stop(this.index, url);
    } else {
      throw new Error('Geckoprofiler only works in Firefox');
    }
  }
}
