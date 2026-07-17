import test from 'ava';
import { computeNonCompositedAnimations } from '../../lib/chrome/trace/non-composited-animations.js';

function animationEvent(id, ts, data) {
  return { name: 'Animation', ts, args: { data: { id, ...data } } };
}

test('decodes the compositeFailed bitmask into failure reasons', t => {
  const trace = {
    traceEvents: [
      animationEvent('a', 1, {
        compositeFailed: (1 << 13) | (1 << 17),
        unsupportedProperties: ['top']
      }),
      // Same animation id at a later phase — deduped.
      animationEvent('a', 2, { compositeFailed: 1 << 13 }),
      // A bit Blink hasn't defined yet must not be dropped silently.
      animationEvent('b', 3, { compositeFailed: 1 << 21 })
    ]
  };

  const result = computeNonCompositedAnimations(trace);

  t.is(result.length, 2);
  t.deepEqual(result[0].failureReasons, [
    'unsupported CSS property',
    'animation has no visible change'
  ]);
  t.deepEqual(result[0].unsupportedProperties, ['top']);
  t.deepEqual(result[1].failureReasons, ['unknown reason (bit 21)']);
});

test('animations without failures are not reported', t => {
  const trace = {
    traceEvents: [animationEvent('a', 1, { compositeFailed: 0 })]
  };
  t.deepEqual(computeNonCompositedAnimations(trace), []);
});
