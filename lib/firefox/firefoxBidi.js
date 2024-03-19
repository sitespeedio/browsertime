import intel from 'intel';
import { toArray } from '../support/util.js';
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

  async setCookie(url, cookie) {
    const cookies = toArray(cookie);
    for (let cookieParts of cookies) {
      const parts = new Array(
        cookieParts.slice(0, cookieParts.indexOf('=')),
        cookieParts.slice(cookieParts.indexOf('=') + 1, cookieParts.length)
      );

      const params = {
        method: 'storage.setCookie',
        params: {
          cookie: {
            name: parts[0],
            value: {
              type: 'string',
              value: parts[1]
            },
            domain: new URL(url).hostname
          }
        }
      };
      try {
        await this.bidi.send(params);
      } catch (error) {
        log.error('Could not set cookie:' + error);
      }
    }
  }
}
