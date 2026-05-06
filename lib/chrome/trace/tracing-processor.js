/**
 * Trace pid/tid/frameId resolver, ported from @sitespeed.io/tracium
 * 0.3.3 (Lighthouse 2018 lineage). Only `findMainFrameIds` is kept —
 * the original module also exposed `getRiskToResponsiveness` and
 * the `_riskPercentiles` math used by Lighthouse's TBT, but those
 * aren't called from Browsertime's pipeline so they're dropped to
 * keep the surface tight.
 */

/**
 * Locate the main renderer's pid/tid/frameId via three fallbacks, in
 * order of how recent the trace events are: the modern
 * TracingStartedInBrowser event (with a frames[] payload), the legacy
 * TracingStartedInPage event, and finally pairing the first
 * navigationStart with the first ResourceSendRequest. Throws when
 * none of the three apply — which means the trace doesn't contain
 * a renderable tab and the caller (parseCpuTrace) will degrade
 * gracefully via its outer try/catch.
 */
export function findMainFrameIds(events) {
  // Prefer the newer TracingStartedInBrowser event first, if it exists.
  const startedInBrowserEvt = events.find(
    e => e.name === 'TracingStartedInBrowser'
  );
  if (
    startedInBrowserEvt &&
    startedInBrowserEvt.args.data &&
    startedInBrowserEvt.args.data.frames
  ) {
    const mainFrame = startedInBrowserEvt.args.data.frames.find(
      frame => !frame.parent
    );
    const frameId = mainFrame && mainFrame.frame;
    const pid = mainFrame && mainFrame.processId;

    const threadNameEvt = events.find(
      e =>
        e.pid === pid &&
        e.ph === 'M' &&
        e.cat === '__metadata' &&
        e.name === 'thread_name' &&
        e.args.name === 'CrRendererMain'
    );
    const tid = threadNameEvt && threadNameEvt.tid;

    if (pid && tid && frameId) {
      return { pid, tid, frameId };
    }
  }

  // Support legacy browser versions that do not emit
  // TracingStartedInBrowser. The first TracingStartedInPage in the
  // trace is the renderer thread of interest. Beware: the
  // TracingStartedInPage event can appear slightly after a
  // navigationStart, so the order of fallbacks matters.
  const startedInPageEvt = events.find(e => e.name === 'TracingStartedInPage');
  if (startedInPageEvt && startedInPageEvt.args && startedInPageEvt.args.data) {
    const frameId = startedInPageEvt.args.data.page;
    if (frameId) {
      return { pid: startedInPageEvt.pid, tid: startedInPageEvt.tid, frameId };
    }
  }

  // Last resort: pair the first navigationStart that's loading the
  // main frame with the first ResourceSendRequest from the same
  // pid/tid. If those agree the renderer is whatever pid/tid they
  // share.
  const navStartEvt = events.find(e =>
    Boolean(
      e.name === 'navigationStart' &&
      e.args &&
      e.args.data &&
      e.args.data.isLoadingMainFrame &&
      e.args.data.documentLoaderURL
    )
  );
  const firstResourceSendEvt = events.find(
    e => e.name === 'ResourceSendRequest'
  );
  if (
    navStartEvt &&
    navStartEvt.args &&
    navStartEvt.args.data &&
    firstResourceSendEvt &&
    firstResourceSendEvt.pid === navStartEvt.pid &&
    firstResourceSendEvt.tid === navStartEvt.tid
  ) {
    const frameId = navStartEvt.args.frame;
    if (frameId) {
      return { pid: navStartEvt.pid, tid: navStartEvt.tid, frameId };
    }
  }

  throw new Error('NO_TRACING_STARTED');
}
