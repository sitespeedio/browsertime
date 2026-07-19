import test from 'ava';
import { computeStyleInvalidations } from '../../lib/chrome/trace/style-invalidations.js';
import { resourceLoaderLocationResolver } from '../../lib/chrome/mediawikiResourceLoader.js';

const SCRIPT_URL = 'https://en.example.org/w/script.js';
const BUNDLE_URL = 'https://en.example.org/w/load.php?modules=a|b';

// line 1: preamble, line 2: module.one, line 3: module.two
const bundleSource =
  '/* preamble */\n' +
  'mw.loader.impl(function(){return["module.one@abc12",function(){}];});\n' +
  'mw.loader.impl(function(){return["module.two@def34",function(){}];});';

function invalidationEvent(name, data) {
  return { name, ts: 1, args: { data } };
}

test('aggregates invalidations by reason, trigger and source', t => {
  const result = computeStyleInvalidations({
    traceEvents: [
      invalidationEvent('StyleRecalcInvalidationTracking', {
        reason: 'Style rule change',
        stackTrace: [{ url: SCRIPT_URL, lineNumber: 1, columnNumber: 1 }]
      }),
      invalidationEvent('StyleRecalcInvalidationTracking', {
        reason: 'Style rule change'
      }),
      invalidationEvent('StyleRecalcInvalidationTracking', {
        reason: 'Affected by :has()'
      }),
      invalidationEvent('LayoutInvalidationTracking', {
        reason: 'Removed from layout',
        // The innermost frame with a URL wins.
        stackTrace: [{ functionName: 'inner' }, { url: SCRIPT_URL }]
      }),
      invalidationEvent('ScheduleStyleInvalidationTracking', {
        changedClass: 'collapsed',
        changedAttribute: 'aria-expanded'
      }),
      invalidationEvent('ScheduleStyleInvalidationTracking', {
        changedClass: 'collapsed'
      })
    ]
  });

  t.is(result.styleRecalcs, 3);
  t.is(result.layoutInvalidations, 1);
  t.deepEqual(result.recalcReasons, [
    { reason: 'Style rule change', count: 2 },
    { reason: 'Affected by :has()', count: 1 }
  ]);
  t.deepEqual(result.layoutReasons, [
    { reason: 'Removed from layout', count: 1 }
  ]);
  t.deepEqual(result.triggers, [
    { kind: 'class', name: 'collapsed', count: 2 },
    { kind: 'attribute', name: 'aria-expanded', count: 1 }
  ]);
  t.deepEqual(result.sources, [{ url: SCRIPT_URL, count: 2 }]);
});

test('resolves invalidation sources to modules when bundles are known', t => {
  const bundles = new Map([
    [BUNDLE_URL, resourceLoaderLocationResolver(bundleSource)]
  ]);
  const result = computeStyleInvalidations(
    {
      traceEvents: [
        invalidationEvent('StyleRecalcInvalidationTracking', {
          reason: 'Style rule change',
          stackTrace: [{ url: BUNDLE_URL, lineNumber: 2, columnNumber: 1 }]
        }),
        invalidationEvent('LayoutInvalidationTracking', {
          reason: 'Removed from layout',
          stackTrace: [{ url: BUNDLE_URL, lineNumber: 2, columnNumber: 5 }]
        }),
        invalidationEvent('StyleRecalcInvalidationTracking', {
          reason: 'Style rule change',
          stackTrace: [{ url: BUNDLE_URL, lineNumber: 3, columnNumber: 1 }]
        })
      ]
    },
    bundles
  );

  t.deepEqual(result.sources, [
    { url: BUNDLE_URL, module: 'module.one', count: 2 },
    { url: BUNDLE_URL, module: 'module.two', count: 1 }
  ]);
});

test('returns undefined when the trace has no invalidation events', t => {
  t.is(
    computeStyleInvalidations({ traceEvents: [{ name: 'Layout' }] }),
    undefined
  );
});

const beforePaint = data => ({ name: data.name, ts: 100, args: { data } });
const afterPaint = data => ({ name: data.name, ts: 900, args: { data } });

test('splits counts on first paint when the trace has the FCP event', t => {
  const result = computeStyleInvalidations({
    traceEvents: [
      { name: 'firstContentfulPaint', ts: 500 },
      beforePaint({
        name: 'LayoutInvalidationTracking',
        reason: 'Added to layout'
      }),
      beforePaint({
        name: 'StyleRecalcInvalidationTracking',
        reason: 'Node was inserted into tree'
      }),
      afterPaint({
        name: 'StyleRecalcInvalidationTracking',
        reason: 'Style rule change',
        stackTrace: [{ url: SCRIPT_URL }]
      }),
      afterPaint({
        name: 'StyleRecalcInvalidationTracking',
        reason: 'Style rule change'
      }),
      afterPaint({
        name: 'ScheduleStyleInvalidationTracking',
        changedClass: 'menu-open'
      })
    ]
  });

  t.is(result.styleRecalcs, 3);
  t.is(result.styleRecalcsAfterFirstPaint, 2);
  t.is(result.layoutInvalidations, 1);
  t.is(result.layoutInvalidationsAfterFirstPaint, 0);
  t.deepEqual(result.recalcReasons, [
    { reason: 'Style rule change', count: 2, afterFirstPaint: 2 },
    { reason: 'Node was inserted into tree', count: 1, afterFirstPaint: 0 }
  ]);
  t.deepEqual(result.layoutReasons, [
    { reason: 'Added to layout', count: 1, afterFirstPaint: 0 }
  ]);
  t.deepEqual(result.triggers, [
    { kind: 'class', name: 'menu-open', count: 1, afterFirstPaint: 1 }
  ]);
  t.deepEqual(result.sources, [
    { url: SCRIPT_URL, count: 1, afterFirstPaint: 1 }
  ]);
});

test('leaves the afterFirstPaint fields out without an FCP event', t => {
  const result = computeStyleInvalidations({
    traceEvents: [
      {
        name: 'StyleRecalcInvalidationTracking',
        ts: 1,
        args: { data: { reason: 'Style rule change' } }
      }
    ]
  });
  t.is(result.styleRecalcsAfterFirstPaint, undefined);
  t.deepEqual(result.recalcReasons, [
    { reason: 'Style rule change', count: 1 }
  ]);
});

const eventAt = (ts, data) => ({ name: data.name, ts, args: { data } });

test('adds the largest-paint window when the trace has LCP candidates', t => {
  const result = computeStyleInvalidations({
    traceEvents: [
      { name: 'firstContentfulPaint', ts: 500 },
      // The final candidate wins, like getLargestContentfulPaintEvent.
      { name: 'largestContentfulPaint::Candidate', ts: 600 },
      { name: 'largestContentfulPaint::Candidate', ts: 1000 },
      eventAt(100, {
        name: 'StyleRecalcInvalidationTracking',
        reason: 'Node was inserted into tree'
      }),
      // Between the paints: after FCP, not after LCP — the bucket that
      // delayed the largest paint.
      eventAt(800, {
        name: 'StyleRecalcInvalidationTracking',
        reason: 'Style rule change'
      }),
      eventAt(1200, {
        name: 'StyleRecalcInvalidationTracking',
        reason: 'Style rule change'
      })
    ]
  });

  t.is(result.styleRecalcs, 3);
  t.is(result.styleRecalcsAfterFirstPaint, 2);
  t.is(result.styleRecalcsAfterLargestContentfulPaint, 1);
  t.deepEqual(result.recalcReasons, [
    {
      reason: 'Style rule change',
      count: 2,
      afterFirstPaint: 2,
      afterLargestContentfulPaint: 1
    },
    {
      reason: 'Node was inserted into tree',
      count: 1,
      afterFirstPaint: 0,
      afterLargestContentfulPaint: 0
    }
  ]);
});
