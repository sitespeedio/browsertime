/**
 * CSS selector matching cost, from Chrome's SelectorStats trace
 * events (the disabled-by-default-blink.debug category, enabled on
 * --enableProfileRun). For every style recalculation Chrome reports
 * per-selector elapsed time, match attempts and match count — the
 * same data DevTools' "CSS selector stats" checkbox shows. Style &
 * layout often dominates main-thread blocking, and this is the only
 * signal that says WHICH selectors the recalc time goes to.
 *
 * Selectors are aggregated across all recalcs in the trace. Two
 * rankings matter and both are kept: elapsed time (what costs now)
 * and match attempts with zero matches (pure waste — selectors
 * evaluated against the whole document for rules that never apply,
 * e.g. a lightbox selector on pages where the lightbox never opens).
 *
 * `styleSheetId` is Chrome's session-internal stylesheet handle —
 * kept so consumers that also collect CSS coverage over CDP can join
 * back to a stylesheet URL, but it is not stable across runs.
 * 'ua-style-sheet' marks Chrome's own user-agent rules; those are
 * not the page's to fix and are excluded from the reported lists
 * (their time still counts in the totals).
 *
 * Returns undefined when the trace has no SelectorStats events (the
 * category is only on for profile runs). Otherwise:
 *   { totalElapsed, totalMatchAttempts, totalMatchCount,
 *     selectors:      [{ selector, styleSheetId?, elapsed,
 *                        matchAttempts, matchCount }, …],
 *     wastedSelectors: [{ … same shape, matchCount always 0 }, …] }
 * elapsed in ms with two decimals (individual selectors are sub-ms),
 * both lists capped at 25 entries; selectors sorted by elapsed desc,
 * wastedSelectors by matchAttempts desc.
 */

const MAX_SELECTORS = 25;
const UA_STYLE_SHEET = 'ua-style-sheet';

function round2(ms) {
  return Math.round(ms * 100) / 100;
}

export function computeSelectorStats(trace) {
  const bySelector = new Map();
  let sawSelectorStats = false;
  let totalElapsedUs = 0;
  let totalMatchAttempts = 0;
  let totalMatchCount = 0;

  for (const event of trace.traceEvents) {
    if (event.name !== 'SelectorStats') continue;
    sawSelectorStats = true;
    const timings =
      (event.args &&
        event.args.selector_stats &&
        event.args.selector_stats.selector_timings) ||
      [];
    for (const timing of timings) {
      const elapsedUs = timing['elapsed (us)'] || 0;
      totalElapsedUs += elapsedUs;
      totalMatchAttempts += timing.match_attempts || 0;
      totalMatchCount += timing.match_count || 0;
      if (timing.style_sheet_id === UA_STYLE_SHEET) continue;
      const key = `${timing.selector}|${timing.style_sheet_id || ''}`;
      let entry = bySelector.get(key);
      if (!entry) {
        entry = {
          selector: timing.selector,
          styleSheetId: timing.style_sheet_id,
          elapsedUs: 0,
          matchAttempts: 0,
          matchCount: 0
        };
        bySelector.set(key, entry);
      }
      entry.elapsedUs += elapsedUs;
      entry.matchAttempts += timing.match_attempts || 0;
      entry.matchCount += timing.match_count || 0;
    }
  }
  if (!sawSelectorStats) return;

  function publish(entry) {
    const result = {
      selector: entry.selector,
      elapsed: round2(entry.elapsedUs / 1000),
      matchAttempts: entry.matchAttempts,
      matchCount: entry.matchCount
    };
    if (entry.styleSheetId) result.styleSheetId = entry.styleSheetId;
    return result;
  }

  const all = [...bySelector.values()];
  const selectors = all
    .toSorted((a, b) => b.elapsedUs - a.elapsedUs)
    .slice(0, MAX_SELECTORS)
    .map(entry => publish(entry));
  const wastedSelectors = all
    .filter(entry => entry.matchCount === 0)
    .toSorted((a, b) => b.matchAttempts - a.matchAttempts)
    .slice(0, MAX_SELECTORS)
    .map(entry => publish(entry));

  return {
    totalElapsed: round2(totalElapsedUs / 1000),
    totalMatchAttempts,
    totalMatchCount,
    selectors,
    wastedSelectors
  };
}
