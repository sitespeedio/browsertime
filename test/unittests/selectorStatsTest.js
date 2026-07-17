import test from 'ava';
import { computeSelectorStats } from '../../lib/chrome/trace/selector-stats.js';

function selectorStatsEvent(timings) {
  return {
    name: 'SelectorStats',
    ts: 1,
    args: { selector_stats: { selector_timings: timings } }
  };
}

function timing(selector, elapsedUs, attempts, matches, styleSheetId) {
  return {
    selector,
    'elapsed (us)': elapsedUs,
    match_attempts: attempts,
    match_count: matches,
    style_sheet_id: styleSheetId
  };
}

test('aggregates selector timings across recalcs', t => {
  const result = computeSelectorStats({
    traceEvents: [
      selectorStatsEvent([
        timing('.slow > *', 900, 500, 0, 'sheet-1'),
        timing('.hit', 100, 50, 10, 'sheet-1')
      ]),
      selectorStatsEvent([timing('.slow > *', 600, 300, 0, 'sheet-1')])
    ]
  });

  t.is(result.totalElapsed, 1.6);
  t.is(result.totalMatchAttempts, 850);
  t.is(result.totalMatchCount, 10);
  t.deepEqual(result.selectors[0], {
    selector: '.slow > *',
    elapsed: 1.5,
    matchAttempts: 800,
    matchCount: 0,
    styleSheetId: 'sheet-1'
  });
  t.deepEqual(
    result.wastedSelectors.map(s => s.selector),
    ['.slow > *']
  );
});

test('user-agent stylesheet selectors count in totals but are not listed', t => {
  const result = computeSelectorStats({
    traceEvents: [
      selectorStatsEvent([
        timing('svg:not(:root)', 500, 100, 0, 'ua-style-sheet'),
        timing('.page', 100, 10, 5, 'sheet-1')
      ])
    ]
  });

  t.is(result.totalElapsed, 0.6);
  t.deepEqual(
    result.selectors.map(s => s.selector),
    ['.page']
  );
  t.deepEqual(result.wastedSelectors, []);
});

test('returns undefined when the trace has no SelectorStats events', t => {
  t.is(computeSelectorStats({ traceEvents: [{ name: 'Layout' }] }), undefined);
});
