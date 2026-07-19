/**
 * Style/layout invalidation attribution, from the
 * devtools.timeline.invalidationTracking events browsertime has
 * always collected with --chrome.timeline but never parsed. The
 * recalculate-style and layout totals say HOW MUCH invalidation work
 * happened; these events say WHY and WHO:
 *
 *  - StyleRecalcInvalidationTracking: one event per invalidated node
 *    with the reason ("Style rule change", "Node was inserted into
 *    tree", "Affected by :has()", …) and often the JS stack that
 *    caused it.
 *  - ScheduleStyleInvalidationTracking: the DOM change that scheduled
 *    an invalidation — which class/attribute/id/pseudo changed on
 *    which node.
 *  - LayoutInvalidationTracking: one event per node whose layout was
 *    invalidated, with reason and often a stack.
 *
 * Aggregated three ways: reason counts (what kind of churn),
 * trigger counts (which class/attribute names keep changing) and
 * source counts (which script did it, from the innermost stack frame
 * with a URL). One noisy script toggling a class on N nodes shows up
 * as N invalidations from that URL with that class as the trigger —
 * exactly the row a developer can act on.
 *
 * Counts, not milliseconds: the events are instant markers, the time
 * they cause is already in cpu.categories.styleLayout and the
 * recalculateStyle summaries.
 *
 * When the trace carries a firstContentfulPaint event, every reason,
 * trigger and source also gets an afterFirstPaint count and the
 * result gets styleRecalcsAfterFirstPaint /
 * layoutInvalidationsAfterFirstPaint totals; with a
 * largestContentfulPaint::Candidate event the same happens for
 * afterLargestContentfulPaint (final candidate, mirroring how
 * getRenderBlocking windows the recalculate-style work to both
 * paints). Invalidations before first paint are mostly the page being
 * built; between the paints they are what delayed the largest paint;
 * after it they are churn on a page the user is already looking at.
 * Absent fields mean the paint event was missing from the trace —
 * consumers can fall back to guessing from the reason categories, and
 * should mind that LCP can land before FCP in real traces (the counts
 * stay truthful per boundary, an "in between" window is then simply
 * not derivable by subtraction).
 *
 * When the optional `bundles` map (url → location resolver from the
 * coverage path) is passed, source frames inside concatenated
 * bundles resolve to the owning module — thousands of invalidations
 * from one giant load.php URL split into per-module rows.
 *
 * Returns undefined when the trace has no invalidation events.
 * Otherwise:
 *   { styleRecalcs, layoutInvalidations,
 *     recalcReasons: [{ reason, count }, …],
 *     layoutReasons: [{ reason, count }, …],
 *     triggers:      [{ kind, name, count }, …],
 *     sources:       [{ url, module?, count }, …] }
 */

const MAX_REASONS = 10;
const MAX_TRIGGERS = 15;
const MAX_SOURCES = 10;

function increment(map, key, afterFirstPaint, afterLargestPaint) {
  if (!key) return;
  const entry = map.get(key) || { count: 0, after: 0, afterLcp: 0 };
  entry.count++;
  if (afterFirstPaint) entry.after++;
  if (afterLargestPaint) entry.afterLcp++;
  map.set(key, entry);
}

// Source identity for an invalidation: the innermost stack frame
// with a URL, resolved to the owning module when the frame lands in
// a known concatenated bundle (trace stack-frame positions are
// 1-based, matching the resolvers). Without bundles the identity is
// just the URL — the pre-existing behaviour.
function sourceEntryFor(
  sources,
  data,
  bundles,
  afterFirstPaint,
  afterLargestPaint
) {
  for (const frame of data.stackTrace || []) {
    if (!frame.url) continue;
    let module_;
    if (bundles && frame.lineNumber !== undefined) {
      const resolver = bundles.get(frame.url);
      if (resolver) {
        module_ = resolver.resolve(frame.lineNumber, frame.columnNumber);
      }
    }
    const key = module_ ? `${frame.url}|${module_.name}` : frame.url;
    let entry = sources.get(key);
    if (!entry) {
      entry = { url: frame.url, count: 0, after: 0, afterLcp: 0 };
      if (module_) entry.module = module_.name;
      sources.set(key, entry);
    }
    entry.count++;
    if (afterFirstPaint) entry.after++;
    if (afterLargestPaint) entry.afterLcp++;
    return;
  }
}

function topEntries(map, limit, publish) {
  return [...map.entries()]
    .toSorted((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(entry => publish(entry));
}

export function computeStyleInvalidations(trace, bundles) {
  const recalcReasons = new Map();
  const layoutReasons = new Map();
  const triggers = new Map();
  const sources = new Map();
  let styleRecalcs = 0;
  let layoutInvalidations = 0;
  let styleRecalcsAfter = 0;
  let layoutInvalidationsAfter = 0;
  let styleRecalcsAfterLcp = 0;
  let layoutInvalidationsAfterLcp = 0;
  let sawInvalidations = false;

  // Same events getRenderBlocking uses to window the recalculate-style
  // work — one boundary per paint, so "after first paint" and "after
  // the largest paint" mean the same thing in both places. LCP is the
  // final candidate, like getLargestContentfulPaintEvent picks it.
  const fcpEvent = trace.traceEvents.find(
    task => task.name === 'firstContentfulPaint'
  );
  const fcpTs = fcpEvent ? fcpEvent.ts : undefined;
  let lcpTs;
  for (const task of trace.traceEvents) {
    if (
      task.name === 'largestContentfulPaint::Candidate' &&
      (lcpTs === undefined || task.ts > lcpTs)
    ) {
      lcpTs = task.ts;
    }
  }

  for (const event of trace.traceEvents) {
    const data = (event.args && event.args.data) || {};
    const afterFirstPaint = fcpTs !== undefined && event.ts > fcpTs;
    const afterLargestPaint = lcpTs !== undefined && event.ts > lcpTs;
    switch (event.name) {
      case 'StyleRecalcInvalidationTracking': {
        sawInvalidations = true;
        styleRecalcs++;
        if (afterFirstPaint) styleRecalcsAfter++;
        if (afterLargestPaint) styleRecalcsAfterLcp++;
        increment(
          recalcReasons,
          data.reason,
          afterFirstPaint,
          afterLargestPaint
        );
        sourceEntryFor(
          sources,
          data,
          bundles,
          afterFirstPaint,
          afterLargestPaint
        );
        break;
      }
      case 'LayoutInvalidationTracking': {
        sawInvalidations = true;
        layoutInvalidations++;
        if (afterFirstPaint) layoutInvalidationsAfter++;
        if (afterLargestPaint) layoutInvalidationsAfterLcp++;
        increment(
          layoutReasons,
          data.reason,
          afterFirstPaint,
          afterLargestPaint
        );
        sourceEntryFor(
          sources,
          data,
          bundles,
          afterFirstPaint,
          afterLargestPaint
        );
        break;
      }
      case 'ScheduleStyleInvalidationTracking': {
        sawInvalidations = true;
        if (data.changedClass) {
          increment(
            triggers,
            `class|${data.changedClass}`,
            afterFirstPaint,
            afterLargestPaint
          );
        }
        if (data.changedAttribute) {
          increment(
            triggers,
            `attribute|${data.changedAttribute}`,
            afterFirstPaint,
            afterLargestPaint
          );
        }
        if (data.changedId) {
          increment(
            triggers,
            `id|${data.changedId}`,
            afterFirstPaint,
            afterLargestPaint
          );
        }
        if (data.changedPseudo) {
          increment(
            triggers,
            `pseudo|${data.changedPseudo}`,
            afterFirstPaint,
            afterLargestPaint
          );
        }
        break;
      }
      default: {
        continue;
      }
    }
  }
  if (!sawInvalidations) return;

  // The after fields only exist when the trace had the matching paint
  // event — an absent field means "unknown", never "zero".
  const withAfter = (published, entry) => {
    if (fcpTs !== undefined) published.afterFirstPaint = entry.after;
    if (lcpTs !== undefined) {
      published.afterLargestContentfulPaint = entry.afterLcp;
    }
    return published;
  };

  const result = {
    styleRecalcs,
    layoutInvalidations,
    recalcReasons: topEntries(recalcReasons, MAX_REASONS, ([reason, entry]) =>
      withAfter({ reason, count: entry.count }, entry)
    ),
    layoutReasons: topEntries(layoutReasons, MAX_REASONS, ([reason, entry]) =>
      withAfter({ reason, count: entry.count }, entry)
    ),
    triggers: topEntries(triggers, MAX_TRIGGERS, ([key, entry]) => {
      const [kind, ...name] = key.split('|');
      return withAfter(
        { kind, name: name.join('|'), count: entry.count },
        entry
      );
    }),
    sources: [...sources.values()]
      .toSorted((a, b) => b.count - a.count)
      .slice(0, MAX_SOURCES)
      .map(entry => {
        const published = { url: entry.url, count: entry.count };
        if (entry.module) published.module = entry.module;
        return withAfter(published, entry);
      })
  };
  if (fcpTs !== undefined) {
    result.styleRecalcsAfterFirstPaint = styleRecalcsAfter;
    result.layoutInvalidationsAfterFirstPaint = layoutInvalidationsAfter;
  }
  if (lcpTs !== undefined) {
    result.styleRecalcsAfterLargestContentfulPaint = styleRecalcsAfterLcp;
    result.layoutInvalidationsAfterLargestContentfulPaint =
      layoutInvalidationsAfterLcp;
  }
  return result;
}
