import test from 'ava';
import { computeStyleInvalidations } from '../../lib/chrome/trace/style-invalidations.js';

const SCRIPT_URL = 'https://en.example.org/w/script.js';

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

test('returns undefined when the trace has no invalidation events', t => {
  t.is(
    computeStyleInvalidations({ traceEvents: [{ name: 'Layout' }] }),
    undefined
  );
});
