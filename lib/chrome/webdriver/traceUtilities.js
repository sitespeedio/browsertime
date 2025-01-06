import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.chrome');

function getLargestContentfulPaintEvent(traceEvents) {
  const lcpCandidates = traceEvents.filter(
    task => task.name === 'largestContentfulPaint::Candidate'
  );

  if (lcpCandidates.length > 0) {
    let lcpEvent = lcpCandidates[0];

    for (const candidate of lcpCandidates) {
      if (candidate.ts > lcpEvent.ts) {
        lcpEvent = candidate;
      }
    }
    return lcpEvent;
  } else {
    log.info('No LCP event found in the trace');
  }
}

function getFirstContentFulPaintEvent(traceEvents) {
  // Get first contentful paint
  const fcpEvent = traceEvents.find(
    task => task.name === 'firstContentfulPaint'
  );

  if (fcpEvent) {
    return fcpEvent;
  } else {
    log.info('Did not find the FCP event in the trace');
  }
}

function getRecalculateStyleElementsAndTimeBefore(traceEvents, timestamp) {
  const recalculatesBefore = traceEvents.filter(
    task =>
      task.cat === 'disabled-by-default-devtools.timeline' &&
      task.name === 'ScheduleStyleRecalculation' &&
      task.ts < timestamp
  );

  const updateLayoutTree = traceEvents.filter(
    task =>
      task.cat === 'blink,devtools.timeline' &&
      task.name === 'UpdateLayoutTree' &&
      task.ts < timestamp &&
      recalculatesBefore.some(
        recalculate => task.args.beginData.frame === recalculate.args.data.frame
      )
  );
  let elements = 0;
  let duration = 0;
  for (let a of updateLayoutTree) {
    elements += a.args.elementCount;
    duration += a.dur;
  }

  return { elements, durationInMillis: duration / 1000 };
}

export async function getRenderBlocking(trace) {
  const renderBlockingInfo = {};

  const urlsWithBlockingInfo = trace.traceEvents.filter(
    task =>
      task.cat === 'devtools.timeline' &&
      task.name === 'ResourceSendRequest' &&
      task.args.data.url &&
      task.args.data.renderBlocking
  );
  for (let asset of urlsWithBlockingInfo) {
    renderBlockingInfo[asset.args.data.url] = asset.args.data.renderBlocking;
  }

  const fcpEvent = getFirstContentFulPaintEvent(trace.traceEvents);
  const lcpEvent = getLargestContentfulPaintEvent(trace.traceEvents);

  const renderBlocking = { recalculateStyle: {}, requests: {} };

  if (fcpEvent) {
    const beforeFCP = getRecalculateStyleElementsAndTimeBefore(
      trace.traceEvents,
      fcpEvent.ts
    );
    renderBlocking.recalculateStyle.beforeFCP = beforeFCP;
  }

  if (lcpEvent) {
    const beforeLCP = getRecalculateStyleElementsAndTimeBefore(
      trace.traceEvents,
      lcpEvent.ts
    );
    renderBlocking.recalculateStyle.beforeLCP = beforeLCP;
  }

  return { renderBlockingInfo, renderBlocking };
}
