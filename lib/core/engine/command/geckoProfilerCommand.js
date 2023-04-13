export class GeckoProfilerCommand {
  constructor(GeckoProfiler, browser, index) {
    this.GeckoProfiler = GeckoProfiler;
    this.browser = browser;
    this.index = index;
  }

  async start() {
    await this.GeckoProfiler.start();
  }

  async stop() {
    const url = await this.browser
      .getDriver()
      .executeScript('return document.documentURI;');

    await this.GeckoProfiler.stop(this.index, url);
  }
}
