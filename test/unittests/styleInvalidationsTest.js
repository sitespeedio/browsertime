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
