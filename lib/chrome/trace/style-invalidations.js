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
 * Returns undefined when the trace has no invalidation events.
 * Otherwise:
 *   { styleRecalcs, layoutInvalidations,
 *     recalcReasons: [{ reason, count }, …],
 *     layoutReasons: [{ reason, count }, …],
 *     triggers:      [{ kind, name, count }, …],
 *     sources:       [{ url, count }, …] }
 */

const MAX_REASONS = 10;
const MAX_TRIGGERS = 15;
const MAX_SOURCES = 10;

function increment(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function sourceUrl(data) {
  for (const frame of data.stackTrace || []) {
    if (frame.url) return frame.url;
  }
}

function topEntries(map, limit, publish) {
  return [...map.entries()]
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(entry => publish(entry));
}

export function computeStyleInvalidations(trace) {
  const recalcReasons = new Map();
  const layoutReasons = new Map();
  const triggers = new Map();
  const sources = new Map();
  let styleRecalcs = 0;
  let layoutInvalidations = 0;
  let sawInvalidations = false;

  for (const event of trace.traceEvents) {
    const data = (event.args && event.args.data) || {};
    switch (event.name) {
      case 'StyleRecalcInvalidationTracking': {
        sawInvalidations = true;
        styleRecalcs++;
        increment(recalcReasons, data.reason);
        increment(sources, sourceUrl(data));
        break;
      }
      case 'LayoutInvalidationTracking': {
        sawInvalidations = true;
        layoutInvalidations++;
        increment(layoutReasons, data.reason);
        increment(sources, sourceUrl(data));
        break;
      }
      case 'ScheduleStyleInvalidationTracking': {
        sawInvalidations = true;
        if (data.changedClass) {
          increment(triggers, `class|${data.changedClass}`);
        }
        if (data.changedAttribute) {
          increment(triggers, `attribute|${data.changedAttribute}`);
        }
        if (data.changedId) {
          increment(triggers, `id|${data.changedId}`);
        }
        if (data.changedPseudo) {
          increment(triggers, `pseudo|${data.changedPseudo}`);
        }
        break;
      }
      default: {
        continue;
      }
    }
  }
  if (!sawInvalidations) return;

  return {
    styleRecalcs,
    layoutInvalidations,
    recalcReasons: topEntries(
      recalcReasons,
      MAX_REASONS,
      ([reason, count]) => ({
        reason,
        count
      })
    ),
    layoutReasons: topEntries(
      layoutReasons,
      MAX_REASONS,
      ([reason, count]) => ({
        reason,
        count
      })
    ),
    triggers: topEntries(triggers, MAX_TRIGGERS, ([key, count]) => {
      const [kind, ...name] = key.split('|');
      return { kind, name: name.join('|'), count };
    }),
    sources: topEntries(sources, MAX_SOURCES, ([url, count]) => ({
      url,
      count
    }))
  };
}
