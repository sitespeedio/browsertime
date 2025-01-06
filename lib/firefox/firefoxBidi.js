import { Bidi } from '../core/engine/command/bidi.js';
import { getLogger } from '@sitespeed.io/log';
import { toArray } from '../support/util.js';
const log = getLogger('browsertime.firefox.bidi');

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
    // bin/browsertime.js --block upload.wikimedia.org https://en.wikipedia.org/wiki/Barack_Obama -n 1 -b firefox
    const patterns = [];
    const block = toArray(blockers);
    for (let b of block) {
      // Block a specific URL
      if (b.startsWith('http')) {
        patterns.push({ type: 'string', pattern: b });
      } else {
        // Block by domain
        patterns.push({ type: 'pattern', hostname: b });
      }
    }

    const bidi = new Bidi(this.driver, this.options.browser);

    const command = {
      method: 'network.addIntercept',
      params: {
        phases: ['beforeRequestSent'],
        urlPatterns: patterns
      }
    };
    const result = await bidi.send(command);
    if (result.type != 'success') {
      log.error(result);
    }

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
        const result = await bidi.send(fail);
        if (result.type != 'success') {
          log.error(result);
        }
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
        cookieParts.slice(cookieParts.indexOf('=') + 1)
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

  async setRequestHeaders(requestHeaders) {
    const headersArray = toArray(requestHeaders);
    const headers = [];
    for (let header of headersArray) {
      if (header.indexOf && header.includes(':')) {
        const parts = header.split(':');
        headers.push({
          name: parts[0],
          value: {
            type: 'string',
            value: parts[1]
          }
        });
      } else {
        log.error(
          'Request headers need to be of the format key:value not ' + header
        );
      }
    }

    const command = {
      method: 'network.addIntercept',
      params: {
        phases: ['beforeRequestSent']
      }
    };
    const bidi = new Bidi(this.driver, this.options.browser);

    await bidi.send(command);
    await bidi.subscribe('network.beforeRequestSent');
    await bidi.onMessage(async function (event) {
      const parsedEvent = JSON.parse(Buffer.from(event.toString()));
      if (parsedEvent.method === 'network.beforeRequestSent') {
        const continueRequest = {
          method: 'network.continueRequest',
          params: {
            request: parsedEvent.params.request.request,
            headers: [...parsedEvent.params.request.headers, ...headers]
          }
        };
        const result = await bidi.send(continueRequest);
        if (result.type != 'success') {
          log.error(result);
        }
      }
    });
  }
}
