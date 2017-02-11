'use strict';

const merge = require('lodash.merge'),
  isEmpty = require('lodash.isempty'),
  log = require('intel'),
  Cookie = require('tough-cookie').Cookie,
  urlParser = require('url'),
  util = require('util'),
  moment = require('moment');

const max = Math.max;

const defaultOptions = {
  skipEntriesFromDiskCache: true,
  doNotSkipPushes: true //if skipEntriesFromDiskCache is true, do not filter pushes
};

function formatMillis(time) {
  return Number(Number(time).toFixed(0));
}

module.exports = {
  eventFromSeleniumLogEntry(logEntry) {
    return JSON.parse(logEntry.message).message;
  },
  harFromEvents(events, options) {
    function populateEntryFromResponse(entry, response) {
      const responseHeaders = response.headers;
      const cookieHeader = getHeaderValue(responseHeaders, 'Set-Cookie');

      entry.response = {
        httpVersion: response.protocol,
        redirectURL: '',
        status: response.status,
        statusText: response.statusText,
        content: {
          mimeType: response.mimeType,
          size: 0
        },
        headersSize: -1,
        bodySize: -1,
        cookies: parseResponseCookies(cookieHeader),
        headers: parseHeaders(responseHeaders)
      };

      let locationHeaderValue = getHeaderValue(responseHeaders, 'Location');
      if (locationHeaderValue) {
        entry.response.redirectURL = locationHeaderValue;
      }

      entry.request.httpVersion = response.protocol;

      if (response.fromDiskCache === true) {
        if (isHttp1x(response.protocol)) {
          // In http2 headers are compressed, so calculating size from headers text wouldn't be correct.
          entry.response.headersSize = calculateResponseHeaderSize(response);
        }

        entry.cache.beforeRequest = {
          lastAccess: '',
          eTag: '',
          hitCount: 0
        }

      } else {
        if (response.requestHeaders) {
          entry.request.headers = parseHeaders(response.requestHeaders);

          const cookieHeader = getHeaderValue(response.requestHeaders, 'Cookie');
          entry.request.cookies = parseRequestCookies(cookieHeader);
        }

        if (isHttp1x(response.protocol)) {
          if (response.headersText) {
            entry.response.headersSize = response.headersText.length;
          } else {
            entry.response.headersSize = calculateResponseHeaderSize(response);
          }

          if (response.requestHeadersText) {
            entry.request.headersSize = response.requestHeadersText.length;
          } else {
            // Since entry.request.httpVersion is now set, we can calculate header size.
            entry.request.headersSize = calculateRequestHeaderSize(entry.request);
          }
        }
      }

      entry.connection = response.connectionId.toString();
      entry._connectionReused = response.connectionReused;

      function parseOptionalTime(timing, start, end) {
        if (timing[start] >= 0) {
          return formatMillis(timing[end] - timing[start]);
        }
        return -1;
      }

      let timing = response.timing;
      if (timing) {
        const blocked = formatMillis(firstNonNegative([timing.dnsStart, timing.connectStart, timing.sendStart]));

        const dns = parseOptionalTime(timing, 'dnsStart', 'dnsEnd');
        const connect = parseOptionalTime(timing, 'connectStart', 'connectEnd');
        const send = formatMillis(timing.sendEnd - timing.sendStart);
        const wait = formatMillis(timing.receiveHeadersEnd - timing.sendEnd);
        const receive = 0;

        const ssl = parseOptionalTime(timing, 'sslStart', 'sslEnd');

        entry.timings = {
          blocked,
          dns,
          connect,
          send,
          wait,
          receive,
          ssl
        };

        entry._requestSentTime = timing.requestTime;
        entry._receiveHeadersEnd = timing.receiveHeadersEnd;
        if (timing.pushStart > 0) {
          // use the same extended field as WebPageTest
          entry._was_pushed = 1;
        }
        entry.time = max(0, blocked) + max(0, dns) + max(0, connect) + send + wait + receive;

        // Some cached responses generate a Network.requestServedFromCache event,
        // but fromDiskCache is still set to false. For those requestSentDelta will be negative.
        if (!entry._servedFromCache) {
          // Calculate offset of any connection already in use and add
          // it to the entries startedDateTime(ignore main page request)
          // this seems only be applicable in http1
          if (response.connectionReused && !entry._mainRequest && isHttp1x(response.protocol)) {
            let requestSentDelta = entry._requestSentTime - entry._requestWillBeSentTime;
            let newStartDateTime = entry._wallTime + requestSentDelta;
            entry._requestSentDelta = requestSentDelta;
            entry.startedDateTime = moment.unix(newStartDateTime).toISOString();
          }
        }
      } else {
        entry.timings = {
          blocked: -1,
          dns: -1,
          connect: -1,
          send: 0,
          wait: 0,
          receive: 0,
          ssl: -1,
          comment: 'No timings available from Chrome'
        };
        entry.time = 0;
      }
    }

    options = merge({}, defaultOptions, options);

    const ignoredRequests = new Set(),
      rootFrameMappings = new Map();

    let pages = [],
      entries = [],
      currentPageId;

    for (let event of events) {
      const message = event,
        params = message.params;

      switch (message.method) {
        case 'Page.frameStartedLoading': {
          const frameId = params.frameId;
          let previousFrameId = entries.find((entry) => entry._frameId === frameId);

          if (rootFrameMappings.has(frameId) || previousFrameId) {
            // This is a sub frame, there's already a page for the root frame
            continue;
          }

          currentPageId = 'page_' + (pages.length + 1);
          let page = {
            id: currentPageId,
            startedDateTime: '',
            title: '',
            pageTimings: {},
            _frameId: frameId
          };
          pages.push(page);
        }
          break;

        case 'Network.requestWillBeSent': {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }
          const request = params.request;
          if (!isSupportedProtocol(request.url)) {
            ignoredRequests.add(params.requestId);
            continue;
          }
          let frameId = rootFrameMappings.get(params.frameId) || params.frameId;
          let page = pages.find((page) => page._frameId === frameId);
          if (!page) {
            log.warn('Request will be sent with requestId ' + params.requestId + ' that can\'t be mapped to any page.');
            continue;
          }

          const cookieHeader = getHeaderValue(request.headers, 'Cookie');

          // Remove fragment, that's what Chrome does.
          const url = urlParser.parse(request.url);
          url.hash = null;

          let req = {
            method: request.method,
            url: urlParser.format(url),
            _timestamp: params.timestamp,
            queryString: parseQueryData(urlParser.parse(url, true).query),
            postData: parsePostData(getHeaderValue(request.headers, 'Content-Type'), request.postData),
            headersSize: -1,
            bodySize: -1, // FIXME calculate based on postData
            _initialPriority: request.initialPriority,
            _priority: request.initialPriority,
            cookies: parseRequestCookies(cookieHeader),
            headers: parseHeaders(request.headers)
          };

          let entry = {
            cache: {},
            startedDateTime: moment.unix(params.wallTime).toISOString(), //epoch float64, eg 1440589909.59248
            _requestWillBeSentTime: params.timestamp,
            _wallTime: params.wallTime,
            _requestId: params.requestId,
            _frameId: params.frameId,
            _initiator: params.initiator.url,
            _initiator_line: params.initiator.lineNumber,
            pageref: currentPageId,
            request: req,
            time: 0
          };

          if (params.redirectResponse) {
            let previousEntry = entries.find((entry) => entry._requestId === params.requestId);
            if (previousEntry) {
              previousEntry._requestId += 'r';
              populateEntryFromResponse(previousEntry, params.redirectResponse);
            } else {
              log.warn('Couldn\'t find original request for redirect response: ' + params.requestId);
            }
          }

          entries.push(entry);

          // this is the first request for this page, so set timestamp of page.
          if (!page._timestamp) {
            entry._mainRequest = true;
            page._wallTime = params.wallTime;
            page._timestamp = params.timestamp;
            page.startedDateTime = entry.startedDateTime;
            // URL is better than blank, and it's what devtools uses.
            page.title = request.url;
          }
        }
          break;

        case 'Network.requestServedFromCache': {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }

          if (ignoredRequests.has(params.requestId)) {
            continue;
          }

          let entry = entries.find((entry) => entry._requestId === params.requestId);
          if (!entry) {
            log.debug('Recieved requestServedFromCache for requestId ' + params.requestId + ' with no matching request.');
            continue;
          }

          entry._servedFromCache = true;
          entry.cache.beforeRequest = {
            lastAccess: '',
            eTag: '',
            hitCount: 0
          }
        }
          break;

        case 'Network.responseReceived': {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }
          if (ignoredRequests.has(params.requestId)) {
            continue;
          }

          let entry = entries.find((entry) => entry._requestId === params.requestId);
          if (!entry) {
            log.debug('Recieved network response for requestId ' + params.requestId + ' with no matching request.');
            continue;
          }
          entry._responseReceivedTime = params.timestamp;
          entry._totalRequestTime = (params.timestamp - entry._requestWillBeSentTime) * 1000;

          try {
            populateEntryFromResponse(entry, params.response);
          } catch (e) {
            log.error('Error parsing response: ' + JSON.stringify(params, null, 2));
            throw e;
          }
        }
          break;

        case 'Network.dataReceived': {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }
          if (ignoredRequests.has(params.requestId)) {
            continue;
          }

          let entry = entries.find((entry) => entry._requestId === params.requestId);
          if (!entry) {
            log.debug('Recieved network data for requestId ' + params.requestId + ' with no matching request.');
            continue;
          }

          entry._dataReceivedTime = entry._responseReceivedTime;
          entry.response.content.size += params.dataLength;
        }
          break;

        case 'Network.loadingFinished': {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }
          if (ignoredRequests.has(params.requestId)) {
            ignoredRequests.delete(params.requestId);
            continue;
          }

          let entry = entries.find((entry) => entry._requestId === params.requestId);
          if (!entry) {
            log.debug('Network loading finished for requestId ' + params.requestId + ' with no matching request.');
            continue;
          }

          const timings = entry.timings;
          timings.receive = formatMillis((params.timestamp - entry._requestSentTime) * 1000 - entry._receiveHeadersEnd);
          entry.time = max(0, timings.blocked) + max(0, timings.dns) + max(0, timings.connect) +
            timings.send + timings.wait + timings.receive;

          entry._loadingFinishedTime = params.timestamp;
          // FIXME, encodedDataLength includes headers according to https://github.com/cyrus-and/chrome-har-capturer/issues/25
          entry.response.bodySize = params.encodedDataLength > 0 ? params.encodedDataLength : entry.response.bodySize;
          //if (entry.response.headersSize > -1) {
          //  entry.response.bodySize -= entry.response.headersSize;
          //}

          // encodedDataLength will be -1 sometimes
          if (params.encodedDataLength > 0) {
            // encodedDataLength seems to be larger than body size sometimes. Perhaps it's because full packets are
            // listed even though the actual data might be very small.
            // I've seen dataLength: 416, encodedDataLength: 1016,

            const compression = Math.max(0, entry.response.bodySize - params.encodedDataLength);
            if (compression > 0) {
              entry.response.content.compression = compression;
            }
          }
        }
          break;

        case 'Page.loadEventFired': {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue;
          }

          let page = pages[pages.length - 1];

          if (params.timestamp && page._timestamp) {
            page.pageTimings.onLoad = formatMillis((params.timestamp - page._timestamp) * 1000);
          }
        }
          break;

        case 'Page.domContentEventFired': {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue;
          }

          let page = pages[pages.length - 1];

          if (params.timestamp && page._timestamp) {
            page.pageTimings.onContentLoad = formatMillis((params.timestamp - page._timestamp) * 1000);
          }
        }
          break;

        case 'Page.frameAttached': {
          const frameId = params.frameId,
            parentId = params.parentFrameId;

          rootFrameMappings.set(frameId, parentId);

          let grandParentId = rootFrameMappings.get(parentId);
          while (grandParentId) {
            rootFrameMappings.set(frameId, grandParentId);
            grandParentId = rootFrameMappings.get(grandParentId);
          }
        }
          break;

        case 'Page.frameScheduledNavigation':
        case 'Page.frameNavigated':
        case 'Page.frameStoppedLoading':
        case 'Page.frameClearedScheduledNavigation':
        case 'Page.frameDetached':
        case 'Page.frameResized':
          // ignore
          break;

        case 'Page.javascriptDialogOpening':
        case 'Page.javascriptDialogClosed':
        case 'Page.screencastFrame':
        case 'Page.screencastVisibilityChanged':
        case 'Page.colorPicked':
        case 'Page.interstitialShown':
        case 'Page.interstitialHidden':
          // ignore
          break;

        case 'Network.loadingFailed': {
          if (ignoredRequests.has(params.requestId)) {
            ignoredRequests.delete(params.requestId);
            continue;
          }

          let entry = entries.find((entry) => entry._requestId === params.requestId);
          if (!entry) {
            log.debug('Network loading failed for requestId ' + params.requestId + ' with no matching request.');
            continue;
          }

          // This could be due to incorrect domain name etc. Sad, but unfortunately not something that a HAR file can
          // represent.
          log.debug('Failed to load url: ' + entry.request.url);
        }
          break;

        case 'Network.webSocketCreated':
        case 'Network.webSocketFrameSent':
        case 'Network.webSocketFrameError':
        case 'Network.webSocketFrameReceived':
        case 'Network.webSocketClosed':
        case 'Network.webSocketHandshakeResponseReceived':
        case 'Network.webSocketWillSendHandshakeRequest':
          // ignore, sadly HAR file format doesn't include web sockets
          break;

        case 'Network.eventSourceMessageReceived':
          // ignore
          break;
        case 'Network.resourceChangedPriority': {
            let entry = entries.find((entry) => entry._requestId === params.requestId);
            entry.request._priority = message.params.newPriority;
          }
          break;

        default:
          log.warn('Unhandled event: ' + message.method);
          break;
      }
    }

    if (options.skipEntriesFromDiskCache) {
      //Pushed responses are served from cache.
      entries = entries.filter((entry) => entry.cache.beforeRequest === undefined ||
                                          (options.doNotSkipPushes === true && entry._was_pushed === 1)
      );
    }

    entries = entries.filter((entry) => {
      // Page doesn't wait for favicon to load, and that's ok (for now).
      if (!entry.response && !entry.request.url.endsWith('.ico')) {
        log.debug('Dropping incomplete request: ' + entry.request.url);
      }
      return entry.response;
    });

    return {
      log: {
        version: '1.2',
        creator: {'name': 'Browsertime', 'version': '1.0'},
        pages,
        entries
      }
    }
  }
};

function calculateRequestHeaderSize(harRequest) {
  let buffer = '';
  buffer = buffer.concat(util.format('%s %s %s\r\n', harRequest.method, harRequest.url, harRequest.httpVersion));

  const headerLines = harRequest.headers.map((header) => util.format('%s: %s\r\n', header.name, header.value));
  buffer = buffer.concat(headerLines.join(''));
  buffer = buffer.concat('\r\n');

  return buffer.length;
}

function calculateResponseHeaderSize(perflogResponse) {
  let buffer = '';
  buffer = buffer.concat(util.format('%s %d %s\r\n', perflogResponse.protocol, perflogResponse.status, perflogResponse.statusText));
  Object.keys(perflogResponse.headers).forEach((key) => {
    buffer = buffer.concat(util.format('%s: %s\r\n', key, perflogResponse.headers[key]));
  });
  buffer = buffer.concat('\r\n');

  return buffer.length;
}

function parseRequestCookies(cookieHeader) {
  return cookieHeader.split(';')
    .filter(Boolean)
    .map(parseCookie);

}

function parseResponseCookies(cookieHeader) {
  return cookieHeader.split('\n')
    .filter(Boolean)
    .map(parseCookie);
}

function parseCookie(cookieString) {
  let cookie = Cookie.parse(cookieString);
  if (!cookie) {
    log.info('Invalid cookie - failed to parse value: ' + cookieString);

    return null;
  }

  return {
    'name': cookie.key,
    'value': cookie.value,
    'path': cookie.path || undefined, // must be undefined, not null, to exclude empty path
    'domain': cookie.domain || undefined,  // must be undefined, not null, to exclude empty domain
    'expires': cookie.expires === 'Infinity' ? undefined : moment(cookie.expires).toISOString(),
    'httpOnly': cookie.httpOnly,
    'secure': cookie.secure
  };
}

function parseHeaders(headers) {
  if (!headers) {
    return [];
  }
  return Object.keys(headers).map((key) => {
    return {
      name: key,
      value: headers[key]
    }
  });
}

function getHeaderValue(headers, header) {
  if (!headers) {
    return '';
  }
  // http header names are case insensitive
  const lowerCaseHeader = header.toLowerCase();
  const headerNames = Object.keys(headers);
  return headerNames.filter((key) => key.toLowerCase() === lowerCaseHeader)
      .map((key) => headers[key]).shift() || '';
}


function parseQueryData(queryString) {
  if (isEmpty(queryString)) {
    return [];
  }
  const paramList = [];
  const queryParams = queryString.split('&');
  for (const paramString of queryParams) {
    const param = paramString.split('=');
    paramList.push(
      {
        'name': param[0],
        'value': param[1] ? param[1] : ''
      });
  }
  return paramList;
}

function parsePostData(contentType, postData) {
  if (isEmpty(contentType) || isEmpty(postData)) {
    return undefined;
  }

  if (contentType === 'application/x-www-form-urlencoded') {
    return {
      mimeType: contentType,
      params: parseQueryData(postData)
    };
  } else {
    // FIXME parse multipart/form-data as well.
    return {
      mimeType: contentType,
      text: postData
    };
  }
}

function isSupportedProtocol(url) {
  return /^https?:/.test(url);
}

function isHttp1x(version) {
  return version.toLowerCase().startsWith('http/1.')
}

function firstNonNegative(values) {
  for (let i = 0; i < values.length; ++i) {
    if (values[i] >= 0)
      return values[i];
  }
  return -1;
}
