import intel from 'intel';
const log = intel.getLogger('browsertime.command.geckoprofiler');
export class GeckoProfiler {
  constructor(GeckoProfiler, browser, index, options, result) {
    this.GeckoProfiler = GeckoProfiler;
    this.browser = browser;
    this.index = index;
    this.options = options;
    this.result = result;
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
        return this.GeckoProfiler.stop(
          this.index,
          this.result[0].url,
          this.result
        );
      }
    } else {
      throw new Error('Geckoprofiler only works in Firefox');
    }
  }
}
