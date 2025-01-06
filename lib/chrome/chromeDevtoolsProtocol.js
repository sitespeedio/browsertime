import { getLogger } from '@sitespeed.io/log';
import CDP from 'chrome-remote-interface';
const log = getLogger('browsertime.chrome.cdp');
import { toArray } from '../support/util.js';
import { traceCategories as defaultTraceCategories } from './settings/traceCategories.js';

const MIME_TYPE_MATCHERS = [
  [/^text\/html/, 'html'],
  [/^text\/plain/, 'plain'],
  [/^text\/css/, 'css'],
  [/^text\/xml/, 'xml'],
  [/javascript/, 'javascript'],
  [/json/, 'json'],
  [/^application\/xml/, 'xml'],
  [/.*/, 'other'] // Always match 'other' if all else fails
];

function getContentType(mimeType) {
  return MIME_TYPE_MATCHERS.find(matcher => matcher[0].test(mimeType))[1];
}

export class ChromeDevtoolsProtocol {
  constructor(options) {
    this.options = options;
    this.chrome = options.chrome || {};
    this.chromeTraceCategories = this.chrome.traceCategories
      ? this.chrome.traceCategories.split(',')
      : [...defaultTraceCategories];
    if (this.chrome.enableTraceScreenshots) {
      this.chromeTraceCategories.push(
        'disabled-by-default-devtools.screenshot'
      );
    }

    if (this.chrome.traceCategory) {
      const extraCategories = toArray(this.chrome.traceCategory);
      Array.prototype.push.apply(this.chromeTraceCategories, extraCategories);
    }

    if (this.chrome.traceCategories || options.cpu) {
      log.info('Use Chrome trace categories: %s', this.chromeTraceCategories);
    }
  }

  async setup() {
    // We create the cdp as early as possible so it can be used in scripts
    // https://bugs.chromium.org/p/chromium/issues/detail?id=824626
    // https://github.com/cyrus-and/chrome-remote-interface/issues/332

    try {
      this.cdpClient = await (this.chrome.android
        ? CDP({
            local: true,
            port: this.options.devToolsPort
          })
        : CDP({ port: this.options.devToolsPort }));
      // Enable what's needs to be enabled
      // Page is needed to inject JS to a page
      await this.cdpClient.Page.enable();
      // Network are needed block URLs, clear the cache, get response bodies, set request headers, set cookies
      await this.cdpClient.Network.enable();
      // enable getting extra performance metrics
      await this.cdpClient.Performance.enable();

      this.isTracingDataCollectedAdded = false;
    } catch (error) {
      log.error('Could not setup the Chrome Devtools Protocol', error);
      throw error;
    }
  }
  async startTrace() {
    this.events = [];
    if (this.isTracingDataCollectedAdded === false) {
      this.isTracingDataCollectedAdded = this.cdpClient.Tracing.dataCollected(
        ({ value }) => {
          this.events.push(...value);
        }
      );
    }
    return this.cdpClient.Tracing.start({
      traceConfig: {
        recordMode: 'recordAsMuchAsPossible',
        includedCategories: this.chromeTraceCategories
      }
    });
  }

  async stopTrace() {
    await this.cdpClient.Tracing.end();
    await this.cdpClient.Tracing.tracingComplete();
    return this.events;
  }

  async injectJavaScript(source) {
    return this.cdpClient.Page.addScriptToEvaluateOnNewDocument({
      source
    });
  }

  async setupCPUThrottling(rate) {
    log.info('Using CPUThrottlingRate: %s', this.chrome.CPUThrottlingRate);
    return this.cdpClient.Emulation.setCPUThrottlingRate({
      rate
    });
  }

  async setBasicAuth(basicAuth) {
    const parts = basicAuth.split('@');
    const basic =
      'Basic ' + Buffer.from(parts[0] + ':' + parts[1]).toString('base64');
    await this.cdpClient.Network.setExtraHTTPHeaders({
      headers: { Authorization: basic }
    });
  }

  async setUserAgent(userAgent) {
    return this.cdpClient.Network.setUserAgentOverride({ userAgent });
  }

  async blockUrls(blockers) {
    const block = toArray(blockers);
    return this.cdpClient.Network.setBlockedURLs({ urls: block });
  }

  async setCookies(url, cookie) {
    const cookies = toArray(cookie);
    for (let cookieParts of cookies) {
      const parts = new Array(
        cookieParts.slice(0, cookieParts.indexOf('=')),
        cookieParts.slice(cookieParts.indexOf('=') + 1)
      );
      await this.cdpClient.Network.setCookie({
        name: parts[0],
        value: parts[1],
        domain: new URL(url).hostname
      });
    }
  }

  async getPerformanceMetrics() {
    return this.cdpClient.Performance.getMetrics();
  }

  async clearBrowserCache() {
    return this.cdpClient.Network.clearBrowserCache();
  }

  async clearBrowserCookies() {
    return this.cdpClient.Network.clearBrowserCookies();
  }

  async loadingFailed() {
    return this.cdpClient.Network.loadingFailed(parameter => {
      if (parameter.type === 'Document') {
        log.debug('Could not load document:' + parameter.errorText);
      }
    });
  }

  getRawClient() {
    return this.cdpClient;
  }

  async setRequestHeaders(requestHeaders) {
    // Our cli don't validate parameters
    // so -run will become -r etc
    const headersArray = toArray(requestHeaders);
    const headers = {};
    for (let header of headersArray) {
      if (header.indexOf && header.includes(':')) {
        const parts = header.split(':');
        headers[parts[0]] = parts[1];
      } else {
        log.error(
          'Request headers need to be of the format key:value not ' + header
        );
      }
    }
    if (Object.keys(headers).length > 0) {
      await this.cdpClient.Network.setExtraHTTPHeaders({
        headers
      });
    }
  }
  async on(event, f) {
    return this.cdpClient.on(event, f);
  }

  async send(cmd, parameters) {
    return this.cdpClient.send(cmd, parameters);
  }

  async close() {
    if (this.cdpClient) {
      return this.cdpClient.close();
    }
  }

  async setResponseBodies(har) {
    if (
      this.chrome.includeResponseBodies === 'html' ||
      this.chrome.includeResponseBodies === 'all'
    ) {
      const resourceTree = await this.cdpClient.Page.getResourceTree();
      const url = resourceTree.frameTree.frame.url;

      for (let entry of har.log.entries) {
        if (entry.request.url === url) {
          try {
            const html = await this.cdpClient.Network.getResponseBody({
              requestId: entry._requestId
            });
            entry.response.content.text = html.body;
          } catch (error) {
            log.debug(
              'Could not find a matching resource to get the HTML',
              error
            );
          }
        } else if (
          this.chrome.includeResponseBodies === 'all' &&
          getContentType(entry.response.content.mimeType) !== 'other'
        ) {
          try {
            const response = await this.cdpClient.Network.getResponseBody({
              requestId: entry._requestId
            });
            entry.response.content.text = response.body;
          } catch (error) {
            log.debug(
              'Could not find a matching resource to get the ' +
                entry.response.content.mimeType,
              error
            );
          }
        }
      }
    }
  }
}
