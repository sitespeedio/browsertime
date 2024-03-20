import { Bidi } from '../core/engine/command/bidi.js';
import intel from 'intel';
import { toArray } from '../support/util.js';
const log = intel.getLogger('browsertime.firefox.bidi');

export class FirefoxBidi {
  constructor(bidi, browsingContextId, driver, options) {
    this.options = options;
    this.bidi = bidi;
    this.driver = driver;
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
      const result = await this.bidi.send(params);
      if (result.type != 'success') {
        log.error(result);
      }
    } catch (error) {
      log.error('Could not inject JavaScript:' + error);
    }
  }

  async blockUrls(blockers) {
    const block = toArray(blockers);
    const bidi = new Bidi(this.driver, this.options.browser);

    console.log(blockers);
    const command = {
      method: 'network.addIntercept',
      params: {
        phases: ['beforeRequestSent'],
        // urlPatters: [{ type: 'pattern', hostname: blockers }]
        urlPatterns: [{ type: 'string', pattern: blockers }]
      }
    };
    const result = await bidi.send(command);
    console.log(result);
    await bidi.subscribe('network.beforeRequestSent');

    await bidi.onMessage(async function (event) {
      const parsedEvent = JSON.parse(Buffer.from(event.toString()));
      if (
        parsedEvent.method === 'network.beforeRequestSent' &&
        parsedEvent.params.isBlocked === true
      ) {
        const fail = {
          method: 'network.failRequest',
          params: {
            request: parsedEvent.params.request.request
          }
        };
        const a = await bidi.send(fail);
      } else if (parsedEvent.method === 'network.beforeRequestSent') {
        const continueReq = {
          method: 'network.continueRequest',
          params: {
            request: parsedEvent.params.request.request
          }
        };
        const a = await bidi.send(continueReq);
        // console.log(a);
      }
    });
  }
  async setBasicAuth(basicAuth) {
    const parts = basicAuth.split('@');
    const bidi = new Bidi(this.driver, this.options.browser);

    const command = {
      method: 'network.addIntercept',
      params: {
        phases: ['authRequired']
      }
    };
    await bidi.send(command);

    await bidi.subscribe('network.authRequired');

    await bidi.onMessage(async function (event) {
      const parsedEvent = JSON.parse(Buffer.from(event.toString()));
      if (parsedEvent.method === 'network.authRequired') {
        const continueWithAuth = {
          method: 'network.continueWithAuth',
          params: {
            request: parsedEvent.params.request.request,
            action: 'provideCredentials',
            credentials: {
              type: 'password',
              username: parts[0],
              password: parts[1]
            }
          }
        };
        const result = await bidi.send(continueWithAuth);
        if (result.type != 'success') {
          log.error(result);
        }
      }
    });
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
        const result = await this.bidi.send(params);
        if (result.type != 'success') {
          log.error(result);
        }
      } catch (error) {
        log.error('Could not set cookie:' + error);
      }
    }
  }
}
