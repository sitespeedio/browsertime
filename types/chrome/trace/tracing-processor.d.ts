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
export function findMainFrameIds(events: any): {
    pid: any;
    tid: any;
    frameId: any;
};
//# sourceMappingURL=tracing-processor.d.ts.map