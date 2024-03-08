import intel from 'intel';
const log = intel.getLogger('browsertime.firefox.bidi');

export class FirefoxBidi {
  constructor(bidi, browsingContextId, options) {
    this.options = options;
    this.bidi = bidi;
    this.browsingContextId = browsingContextId;
  }

  async injectJavaScript(script) {
    const params = {
      method: 'script.addPreloadScript',
      params: {
        functionDeclaration: script
      }
    };

    try {
      await this.bidi.send(params);
    } catch (error) {
      log.error('Could not inject JavaScript:' + error);
    }
  }
}
