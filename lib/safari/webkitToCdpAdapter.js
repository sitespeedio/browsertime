import { getLogger } from '@sitespeed.io/log';

const log = getLogger('browsertime.safari.adapter');

const PRIORITIES = { low: 'Low', medium: 'Medium', high: 'High' };

/**
 * Adapts WebKit Inspector Protocol network events to Chrome DevTools Protocol
 * format so they can be processed by chrome-har.
 */
export class WebkitToCdpAdapter {
  constructor() {
    this.messages = [];
    this.responseMap = new Map();
    this.requestMap = new Map();
    this.requestTimestamps = new Map(); // requestId -> { timestamp, wallTime }
    this.mainFrameId = undefined;
    this.pageCreated = false;
  }

  onWebkitEvent(method, params) {
    switch (method) {
      case 'Network.requestWillBeSent': {
        const adapted = this._adaptRequestWillBeSent(params);

        // chrome-har needs a Page.frameNavigated event to create a page.
        // Inject it when we see the first Document request.
        if (adapted.type === 'Document') {
          // The start of the navigation, also when Safari later moves the
          // page to a new process and the messages before that are removed.
          this.navigationStart ??= adapted.wallTime * 1000;
        }
        if (!this.pageCreated && adapted.type === 'Document') {
          this.mainFrameId = adapted.frameId || 'main';
          this.messages.push({
            method: 'Page.frameStartedLoading',
            params: {
              frameId: this.mainFrameId
            }
          });
          this.pageCreated = true;
        }

        this.messages.push({
          method: 'Network.requestWillBeSent',
          params: adapted
        });
        this.requestMap.set(params.requestId, adapted);
        break;
      }
      case 'Network.responseReceived': {
        const adapted = {
          method: 'Network.responseReceived',
          params: this._adaptResponseReceived(params)
        };
        this.messages.push(adapted);
        this.responseMap.set(params.requestId, adapted);
        break;
      }
      case 'Network.dataReceived': {
        this.messages.push({
          method: 'Network.dataReceived',
          params: {
            requestId: params.requestId,
            timestamp: params.timestamp,
            dataLength: params.dataLength,
            encodedDataLength: params.encodedDataLength || 0
          }
        });
        break;
      }
      case 'Network.loadingFinished': {
        this._patchResponseWithMetrics(params);
        this.messages.push({
          method: 'Network.loadingFinished',
          params: {
            requestId: params.requestId,
            timestamp: params.timestamp,
            encodedDataLength:
              params.metrics?.responseBodyBytesReceived ??
              params.encodedDataLength ??
              0
          }
        });
        break;
      }
      case 'Network.loadingFailed': {
        this.messages.push({
          method: 'Network.loadingFailed',
          params: {
            requestId: params.requestId,
            timestamp: params.timestamp,
            errorText: params.errorText || 'Failed',
            canceled: params.canceled || false,
            type: params.type
          }
        });
        break;
      }
      case 'Network.requestServedFromMemoryCache': {
        this.messages.push({
          method: 'Network.requestServedFromMemoryCache',
          params
        });
        break;
      }
      case 'Target.targetCreated': {
        // Safari moves a navigation to a new process with a new target, and
        // loads the document again there. Remove the request from the old
        // process, because its time uses the clock of that process.
        if (params.targetInfo?.isProvisional && this.responseMap.size === 0) {
          this.messages = [];
          this.requestTimestamps.clear();
          this.pageCreated = false;
        }
        break;
      }
      case 'Page.loadEventFired': {
        this.messages.push({
          method: 'Page.loadEventFired',
          params: { timestamp: params.timestamp }
        });
        break;
      }
      case 'Page.domContentEventFired': {
        this.messages.push({
          method: 'Page.domContentEventFired',
          params: { timestamp: params.timestamp }
        });
        break;
      }
      default: {
        log.debug('Unhandled WebKit event: %s', method);
      }
    }
  }

  _adaptRequestWillBeSent(params) {
    // Store timestamp mapping for converting timing.requestTime to epoch-relative
    this.requestTimestamps.set(params.requestId, {
      timestamp: params.timestamp,
      wallTime: params.walltime || params.wallTime || Date.now() / 1000
    });

    return {
      requestId: params.requestId,
      frameId: params.frameId,
      loaderId: params.loaderId || params.requestId,
      documentURL: params.documentURL || '',
      timestamp: params.timestamp,
      wallTime: params.walltime || params.wallTime || Date.now() / 1000,
      type: params.type,
      initiator: params.initiator || { type: 'other' },
      request: {
        url: params.request?.url || '',
        method: params.request?.method || 'GET',
        headers: params.request?.headers || {},
        postData: params.request?.postData,
        initialPriority: 'Medium'
      },
      redirectResponse: params.redirectResponse
        ? this._adaptResponse(params.redirectResponse)
        : undefined
    };
  }

  _adaptResponseReceived(params) {
    return {
      requestId: params.requestId,
      frameId: params.frameId,
      loaderId: params.loaderId || params.requestId,
      timestamp: params.timestamp,
      type: params.type,
      response: this._adaptResponse(params.response || {})
    };
  }

  _adaptResponse(response) {
    const timing = response.timing
      ? this._adaptTiming(response.timing)
      : undefined;

    return {
      url: response.url || '',
      status: response.status || 0,
      statusText: response.statusText || '',
      headers: response.headers || {},
      mimeType: response.mimeType || '',
      connectionId: String(response.connectionId || '0'),
      remoteIPAddress: response.remoteIPAddress || '',
      remotePort: response.remotePort || 0,
      protocol: response.protocol || '',
      encodedDataLength: response.encodedDataLength || 0,
      fromDiskCache:
        response.source === 'disk-cache' ||
        response.source === 'memory-cache' ||
        response.fromDiskCache === true,
      fromServiceWorker: response.source === 'service-worker' || false,
      timing
    };
  }

  _adaptTiming(timing) {
    // WebKit timing fields are ms offsets from fetchStart, similar to CDP
    // but secureConnectionStart can be an absolute timestamp when reused
    let sslStart = timing.secureConnectionStart ?? -1;
    let sslEnd = timing.connectEnd ?? -1;

    // Detect invalid SSL timestamps (WebKit sends huge negative numbers for reused connections)
    if (sslStart > 100_000 || sslStart < -1) {
      sslStart = -1;
      sslEnd = -1;
    }

    return {
      // The phase times are ms from fetchStart. When Safari moves a navigation
      // to a new process, fetchStart is long before startTime.
      requestTime: Number(timing.fetchStart) || Number(timing.startTime) || 0,
      dnsStart: Number(timing.domainLookupStart ?? -1),
      dnsEnd: Number(timing.domainLookupEnd ?? -1),
      connectStart: Number(timing.connectStart ?? -1),
      connectEnd: Number(timing.connectEnd ?? -1),
      sslStart: Number(sslStart),
      sslEnd: Number(sslEnd),
      sendStart: Number(timing.requestStart ?? -1),
      sendEnd: Number(timing.requestStart ?? -1),
      receiveHeadersEnd: Number(timing.responseStart ?? -1)
    };
  }

  _patchResponseWithMetrics(loadingFinishedParams) {
    const metrics = loadingFinishedParams.metrics;
    if (!metrics) return;

    const request = this.requestMap.get(
      loadingFinishedParams.requestId
    )?.request;
    if (request && PRIORITIES[metrics.priority]) {
      request.initialPriority = PRIORITIES[metrics.priority];
    }

    const responseMsg = this.responseMap.get(loadingFinishedParams.requestId);
    if (!responseMsg) return;

    const response = responseMsg.params.response;
    if (metrics.remoteAddress && !response.remoteIPAddress) {
      const separator = metrics.remoteAddress.lastIndexOf(':');
      response.remoteIPAddress =
        separator === -1
          ? metrics.remoteAddress
          : metrics.remoteAddress.slice(0, separator);
    }
    if (metrics.protocol && !response.protocol) {
      response.protocol = metrics.protocol;
    }
    if (metrics.connectionIdentifier) {
      response.connectionId = metrics.connectionIdentifier;
    }
    // The headers that were sent, the request event only has some of them
    if (metrics.requestHeaders) {
      response.requestHeaders = metrics.requestHeaders;
    }
  }

  getMessages() {
    return [...this.messages];
  }

  reset() {
    this.messages = [];
    this.responseMap.clear();
    this.requestMap.clear();
    this.requestTimestamps.clear();
    this.pageCreated = false;
    this.mainFrameId = undefined;
  }
}
