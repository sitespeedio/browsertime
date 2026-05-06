/**
 * Trace → tab-of-interest extractor. Ported from @sitespeed.io/tracium
 * 0.3.3. Picks the renderer pid/tid/frameId, locates navigation/paint
 * landmark events, and returns the chronologically-stable subset of
 * events that belong to the inspected tab plus its main-thread
 * subset that the task-builder consumes.
 */

import { getLogger } from '@sitespeed.io/log';
import { findMainFrameIds } from './tracing-processor.js';

const log = getLogger('browsertime.chrome.trace');

const ACCEPTABLE_NAVIGATION_URL_REGEX = /^(chrome|https?|file):/;

function getTimestamp(event) {
  return event && event.ts;
}

function isNavigationStartOfInterest(event) {
  return (
    event.name === 'navigationStart' &&
    (!event.args.data ||
      !event.args.data.documentLoaderURL ||
      ACCEPTABLE_NAVIGATION_URL_REGEX.test(event.args.data.documentLoaderURL))
  );
}

/**
 * Stable sort by `ts`. JavaScript's Array.prototype.sort isn't
 * guaranteed stable across engines historically, and trace event
 * order matters when ts collides (B/E pairing breaks otherwise).
 * The implementation sorts an indices array first, breaking ties by
 * source index, so equal-ts events keep their original ordering.
 */
function filteredStableSort(traceEvents, filter) {
  const indices = [];
  for (const [srcIndex, traceEvent] of traceEvents.entries()) {
    if (filter(traceEvent)) {
      indices.push(srcIndex);
    }
  }
  indices.sort((indexA, indexB) => {
    const result = traceEvents[indexA].ts - traceEvents[indexB].ts;
    return result || indexA - indexB;
  });
  const sorted = [];
  for (const index of indices) {
    sorted.push(traceEvents[index]);
  }
  return sorted;
}

export function computeTraceOfTab(trace) {
  // Parse the trace for our key events and sort them by timestamp.
  // The sort *must* be stable to keep events correctly nested.
  const keyEvents = filteredStableSort(trace.traceEvents, e => {
    return (
      e.cat.includes('blink.user_timing') ||
      e.cat.includes('loading') ||
      e.cat.includes('devtools.timeline') ||
      e.cat === '__metadata'
    );
  });

  const mainFrameIds = findMainFrameIds(keyEvents);

  // Filter to just events matching the frame ID for sanity.
  const frameEvents = keyEvents.filter(
    e => e.args.frame === mainFrameIds.frameId
  );

  // Our navStart will be the last frame navigation in the trace.
  const navigationStart = frameEvents.findLast(e =>
    isNavigationStartOfInterest(e)
  );
  if (!navigationStart) throw new Error('NO_NAVSTART');

  // Find our first paint of this frame.
  const firstPaint = frameEvents.find(
    e => e.name === 'firstPaint' && e.ts > navigationStart.ts
  );

  // fMP follows at/after the FP.
  let firstMeaningfulPaint = frameEvents.find(
    e => e.name === 'firstMeaningfulPaint' && e.ts > navigationStart.ts
  );
  let fmpFellBack = false;

  // If there was no firstMeaningfulPaint event found in the trace,
  // network-idle detection may have not been triggered before the
  // capture finished. Use the last firstMeaningfulPaintCandidate.
  if (!firstMeaningfulPaint) {
    const fmpCand = 'firstMeaningfulPaintCandidate';
    fmpFellBack = true;
    log.debug(
      'trace-of-tab',
      `No firstMeaningfulPaint found, falling back to last ${fmpCand}`
    );
    const lastCandidate = frameEvents.findLast(e => e.name === fmpCand);
    if (!lastCandidate) {
      log.debug(
        'trace-of-tab',
        'No `firstMeaningfulPaintCandidate` events found in trace'
      );
    }
    firstMeaningfulPaint = lastCandidate;
  }

  const load = frameEvents.find(
    e => e.name === 'loadEventEnd' && e.ts > navigationStart.ts
  );
  const domContentLoaded = frameEvents.find(
    e => e.name === 'domContentLoadedEventEnd' && e.ts > navigationStart.ts
  );

  // Subset all trace events to just our tab's process (incl threads
  // other than main). Stable-sort to keep events correctly nested.
  const processEvents = filteredStableSort(
    trace.traceEvents,
    e => e.pid === mainFrameIds.pid
  );

  const mainThreadEvents = processEvents.filter(
    e => e.tid === mainFrameIds.tid
  );

  // traceEnd must exist since at least navigationStart was verified.
  let traceEnd = trace.traceEvents[0];
  for (const evt of trace.traceEvents) {
    if (evt.ts > traceEnd.ts) traceEnd = evt;
  }
  const fakeEndOfTraceEvt = { ts: traceEnd.ts + (traceEnd.dur || 0) };

  const timestamps = {
    navigationStart: navigationStart.ts,
    firstPaint: getTimestamp(firstPaint),
    firstMeaningfulPaint: getTimestamp(firstMeaningfulPaint),
    traceEnd: fakeEndOfTraceEvt.ts,
    load: getTimestamp(load),
    domContentLoaded: getTimestamp(domContentLoaded)
  };

  const getTiming = ts => (ts - navigationStart.ts) / 1000;
  const maybeGetTiming = ts => (ts === undefined ? undefined : getTiming(ts));
  const timings = {
    navigationStart: 0,
    firstPaint: maybeGetTiming(timestamps.firstPaint),
    firstMeaningfulPaint: maybeGetTiming(timestamps.firstMeaningfulPaint),
    traceEnd: getTiming(timestamps.traceEnd),
    load: maybeGetTiming(timestamps.load),
    domContentLoaded: maybeGetTiming(timestamps.domContentLoaded)
  };

  return {
    timings,
    timestamps,
    processEvents,
    mainThreadEvents,
    mainFrameIds,
    navigationStartEvt: navigationStart,
    firstPaintEvt: firstPaint,
    firstMeaningfulPaintEvt: firstMeaningfulPaint,
    loadEvt: load,
    domContentLoadedEvt: domContentLoaded,
    fmpFellBack
  };
}
