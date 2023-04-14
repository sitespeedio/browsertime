import intel from 'intel';
const log = intel.getLogger('browsertime.command.geckoprofiler');
export class GeckoProfiler {
  constructor(GeckoProfiler, browser, index, options) {
    this.GeckoProfiler = GeckoProfiler;
    this.browser = browser;
    this.index = index;
    this.options = options;
  }

  async start() {
    if (this.options.browser === 'firefox') {
      if (this.options.firefox.geckoProfilerRecordingType === 'custom') {
        return this.GeckoProfiler.start();
      } else {
        log.info(
          'You need to set geckoProfilerRecordingType to custom to turn on the profiler in scripting'
        );
      }
    } else {
      throw new Error('Geckoprofiler only works in Firefox');
    }
  }

  async stop() {
    if (this.options.browser === 'firefox') {
      if (this.options.firefox.geckoProfilerRecordingType === 'custom') {
        const url = await this.browser
          .getDriver()
          .executeScript('return document.documentURI;');

        return this.GeckoProfiler.stop(this.index, url);
      }
    } else {
      throw new Error('Geckoprofiler only works in Firefox');
    }
  }
}
