'use strict';

let log = require('intel'),
  Cookie = require('tough-cookie').Cookie,
  url = require('url'),
  moment = require('moment');

module.exports = {
  eventFromLogEntry: function(logEntry) {
    const logContent = JSON.parse(logEntry.message);

    return {
      timestamp: logEntry.timestamp,
      method: logContent.message.method,
      data: logContent.message.params,
      webview: logContent.webview
    }
  },
  harFromEvents: function(events) {
    let pages = [],
      entries = [],
      currentPageId;

    for (let event of events) {
      const data = event.data;
      switch (event.method) {
        case 'Page.frameStartedLoading':
        {
          currentPageId = 'page_' + (pages.length + 1);
          let page = {
            id: currentPageId,
            startedDateTime: moment(event.timestamp).format(),
            title: '', // FIXME fill in later
            pageTimings: {}
          };
          pages.push(page);
        }
          break;

        case 'Network.requestWillBeSent':
        {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }

          let req = {
            method: data.request.method,
            url: data.request.url,
            timestamp: data.timestamp,
            queryString: [],
            headersSize: 0,
            bodySize: 0,
            cookies: [],
            headers: parseHeaders(data.request.headers)
          };

          let entry = {
            cache: {},
            startedDateTime: moment(data.wallTime * 1000).format(), //epoch float64, eg 1440589909.59248
            _requestId: data.requestId,
            pageref: currentPageId,
            request: req,
            time: 0
          };

          if (data.redirectResponse) {
            let previousEntry = entries.find((entry) => {
              return entry._requestId === data.requestId;
            });
            previousEntry._requestId = previousEntry._requestId + 'r';
            populateEntryFromResponse(previousEntry, data.redirectResponse, data.timestamp);
            previousEntry.response.redirectURL = data.request.url;
          }

          entries.push(entry);

          let page = pages[pages.length - 1];
          // this is the first request for this page, so set timestamp of page.
          if (!page.timestamp) {
            page.timestamp = data.timestamp
          }
        }
          break;

        case 'Network.responseReceived':
        {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }

          let entry = entries.find((entry) => {
            return entry._requestId === data.requestId;
          });
          if (!entry) {
            log.warn('Recieved network response for requestId ' + data.requestId + ' with no matching request.');
            continue;
          }

          populateEntryFromResponse(entry, data.response, data.timestamp);

          entry.time = (data.timestamp - entry.request.timestamp) * 1000;
        }
          break;

        case 'Network.dataReceived':
        {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }

          let entry = entries.find((entry) => {
            return entry._requestId === data.requestId;
          });
          if (!entry) {
            log.warn('Recieved network data for requestId ' + data.requestId + ' with no matching request.');
            continue;
          }

          entry.response.content.size += data.dataLength
        }
          break;

        case 'Network.loadingFinished':
        {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue
          }

          let entry = entries.find((entry) => {
            return entry._requestId === data.requestId;
          });
          if (!entry) {
            log.warn('Network loading finished for requestId ' + data.requestId + ' with no matching request.');
            continue;
          }

          entry.response.bodySize = data.encodedDataLength - Number(entry.response.headersSize);
          entry.response.content.compression = entry.response.content.size - entry.response.bodySize;
          entry.time = (data.timestamp - entry.request.timestamp) * 1000;
          //entry.timings.receive = (entry.timings.receive + data.timestamp*1000);
        }
          break;

        case 'Page.loadEventFired':
        {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue;
          }

          let page = pages[pages.length - 1];
          page.pageTimings.onLoad = Number((data.timestamp - page.timestamp) * 1000)
        }
          break;

        case 'Page.domContentEventFired':
        {
          if (pages.length < 1) {
            //we havent loaded any pages yet.
            continue;
          }

          let page = pages[pages.length - 1];
          page.pageTimings.onContentLoad = Number((data.timestamp - page.timestamp) * 1000)
        }
          break;
      }
    }

    entries = entries.filter((entry) => {
      if (!entry.response) {
        log.warn('Entry without response!: ' + JSON.stringify(entry));
      }
      return entry.response;
    });

    return {
      log: {
        version: "1.2",
        creator: {"name": "Browsertime", "version": "1.0"},
        pages,
        entries
      }
    }
  }
};

function populateEntryFromResponse(entry, response, timestamp) {
  entry.request.httpVersion = response.protocol;

  const cookieHeader = response.requestHeaders.Cookie || '';
  entry.request.cookies = parseCookies(cookieHeader.split(';'));

  entry.response = {
    httpVersion: response.protocol,
    redirectURL: '',
    status: response.status,
    statusText: response.statusText,
    content: {
      mimeType: response.mimeType,
      size: 0
    },
    headersSize: 0,
    bodySize: 0,
    cookies: [],
    headers: parseHeaders(response.headers)
  };

  let blocked = response.timing["dnsStart"];
  if (blocked < 0.0) {
    blocked = 0.0
  }
  let dns = response.timing["dnsEnd"] - response.timing["dnsStart"];
  if (dns < 0.0) {
    dns = 0.0
  }
  let connect = response.timing["connectEnd"] - response.timing["connectStart"];
  if (connect < 0.0) {
    connect = 0.0
  }
  let send = response.timing["sendEnd"] - response.timing["sendStart"];
  if (send < 0.0) {
    send = 0.0
  }
  let wait = response.timing["receiveHeadersEnd"] - response.timing["sendEnd"];
  if (wait < 0.0) {
    wait = 0.0
  }
  let ssl = response.timing["sslEnd"] - response.timing["sslStart"];
  if (ssl < 0.0) {
    ssl = 0.0
  }

  entry.timings = {
    blocked,
    dns,
    connect,
    send,
    wait,
    receive: timestamp - response.timing["requestTime"],
    ssl
  }

}

function parseCookies(cookieStrings) {
  return cookieStrings.filter(Boolean).map((cookieString) => {
    let cookie = Cookie.parse(cookieString);
    return {
      'name': cookie.key,
      'value': cookie.value,
      'path': cookie.path || undefined, // must be undefined, not null, to exclude empty path
      'domain': cookie.domain || undefined,  // must be undefined, not null, to exclude empty domain
      'expires': cookie.expires === 'Infinity' ? undefined : moment(cookie.expires).toISOString(),
      'httpOnly': cookie.httpOnly,
      'secure': cookie.secure
    };
  });
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


function parsePostParams(text) {
  var paramList = [];
  var queryString = url.parse(text, true).query;
  Object.keys(queryString).forEach(function(name) {
    var value = queryString[name];
    if (!Array.isArray(value))
      value = [value];
    value.forEach(function(v) {
      paramList.push(
        {
          "name": name,
          "value": v
          //                    "fileName": "example.pdf",
          //                    "contentType": "application/pdf",
        });
    });
  });
  return paramList;
}

