'use strict';

const log = require('intel').getLogger('browsertime.chrome.trace');

// Adopting the Lighthouse way to clean the Trace log
// https://github.com/GoogleChrome/lighthouse/blob/50a68ab2bf0115427e767e5e40dfe6be671902fe/lighthouse-core/config/config.js#L29-L110
// When this gets an own module, let us use that!
// cleanTrace is run to remove duplicate TracingStartedInPage events,
// and to change TracingStartedInBrowser events into TracingStartedInPage.
// This is done by searching for most occuring threads and basing new events
// off of those.
function cleanTrace(trace, url) {
  const traceEvents = trace.traceEvents;
  // Keep track of most occuring threads
  const threads = [];
  const countsByThread = {};
  const traceStartEvents = [];
  const makeMockEvent = (evt, ts) => {
    return {
      pid: evt.pid,
      tid: evt.tid,
      ts: ts || 0, // default to 0 for now
      ph: 'I',
      cat: 'disabled-by-default-devtools.timeline',
      name: 'TracingStartedInPage',
      args: {
        data: {
          page: evt.frame,
          frames: [
            {
              frame: evt.frame,
              name: '',
              url: url
            }
          ]
        }
      },
      s: 't'
    };
  };

  const makeNavStart = (evt, ts, tts, fid, url) => {
    return {
      args: {
        data: {
          documentLoaderURL: url,
          isLoadingMainFrame: true,
          navigationId: 'insertedByBrowsertime'
        },
        frame: fid
      },
      cat: 'blink.user_timing',
      name: 'navigationStart',
      ph: 'R',
      pid: evt.pid,
      tid: evt.tid,
      ts: ts || 0,
      tts: tts || 0
    };
  };

  let frame;
  let data;
  let name;
  let counter;

  traceEvents.forEach((evt, idx) => {
    if (evt.name.startsWith('TracingStartedIn')) {
      traceStartEvents.push(idx);
    }

    // find the event's frame
    data =
      evt.args && (evt.args.data || evt.args.beginData || evt.args.counters);
    frame = (evt.args && evt.args.frame) || (data && (data.frame || data.page));

    if (!frame) {
      return;
    }

    // Increase occurences count of the frame
    name = `pid${evt.pid}-tid${evt.tid}-frame${frame}`;
    counter = countsByThread[name];
    if (!counter) {
      counter = {
        pid: evt.pid,
        tid: evt.tid,
        frame: frame,
        count: 0
      };
      countsByThread[name] = counter;
      threads.push(counter);
    }
    counter.count++;
  });

  // find most active thread (and frame)
  threads.sort((a, b) => b.count - a.count);
  const mostActiveFrame = threads[0];

  // Remove all current TracingStartedIn* events, storing
  // the first events ts.
  const ts =
    traceEvents[traceStartEvents[0]] && traceEvents[traceStartEvents[0]].ts;

  const tts =
    traceEvents[traceStartEvents[0]] && traceEvents[traceStartEvents[0]].tts;

  // account for offset after removing items
  let i = 0;
  for (let dup of traceStartEvents) {
    traceEvents.splice(dup - i, 1);
    i++;
  }

  // Add a new TracingStartedInPage event based on most active thread
  // and using TS of first found TracingStartedIn* event

  // With Chrome 58 we got undefined events on Travis (I cant't reproduce it on my local)
  if (mostActiveFrame !== undefined) {
    traceEvents.unshift(makeMockEvent(mostActiveFrame, ts));
  } else {
    // sometimes it seems we are missing inserting the 'TracingStartedInPage
    // let log and find out more
    log.error(
      'Missing most active frame. Number of threads %s, Number of TraceEvents %s and Threads %j',
      threads.length,
      traceEvents.length,
      threads
    );
  }

  // Verify that we got a navigationStart event for that frame. In Chrome 76 we started to get
  // navigations that doesn't match the main frame.
  // https://github.com/sitespeedio/browsertime/issues/902
  const navigationEvents = traceEvents.filter(
    e => e.args.frame === mostActiveFrame.frame && e.name === 'navigationStart'
  );

  // Tracium needs a navigation start event to fire, but when we test SPAs that
  // isn't happening. Best way for now is just to insert it our selves.
  if (navigationEvents.length === 0) {
    log.info(
      'Injecting navigationStart event in the trace log since we could not find any for the most active frame.'
    );
    traceEvents.unshift(
      makeNavStart(mostActiveFrame, ts, tts, mostActiveFrame.frame, url)
    );
  }

  return trace;
}

module.exports = {
  parse(events, url) {
    //  const cleaned = [];

    /*for (let event of events) {
      if (event.method === 'Tracing.dataCollected') {
        cleaned.push(event.params);
      }
    }*/
    return cleanTrace({ traceEvents: events }, url);
  }
};
