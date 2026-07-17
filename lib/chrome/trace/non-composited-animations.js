/**
 * Non-composited animations — animations that triggered Layout or
 * Paint instead of running entirely on the compositor thread.
 *
 * Compositor-only animations (transform, opacity) hand off to the
 * GPU and don't block the main thread. Anything that touches
 * `top` / `left` / `width` / `box-shadow` / non-transformable
 * filters / etc. forces a per-frame layout or paint, which means
 * jank on busy main threads.
 *
 * Chrome marks these in the trace via `Animation` events whose
 * `args.data.compositeFailed` bitmask is non-zero, plus a list of
 * `unsupportedProperties` strings. Chrome often omits the property
 * list (the bitmask is the only signal), so the bitmask is decoded
 * into `failureReasons` strings here — otherwise consumers show "an
 * animation failed" with no way to say why.
 *
 * The bit meanings come from Blink's CompositorAnimations
 * FailureReason enum (compositor_animations.h, kFailureReasonCount
 * = 21 as of Chrome ~M140): bit values are stable and never reused,
 * so decoding old traces is safe. Bits 8/11/14 are retired in
 * current Blink but kept here for traces from older Chrome versions.
 * Unknown future bits decode to 'unknown reason (bit N)' instead of
 * being dropped.
 *
 * Returns: [{ name, id, compositeFailed, failureReasons,
 *             unsupportedProperties, startTime }, …]
 *   name            — args.data.nodeName when present (rare)
 *   id              — args.data.id (compositor-internal)
 *   compositeFailed — bitmask of failure reasons
 *   failureReasons  — the bitmask decoded to human-readable strings
 *   unsupportedProperties — array of property names that blocked
 *                           composite (e.g. ['top','box-shadow'])
 *   startTime       — event ts in microseconds (raw trace timestamp)
 */

// Blink FailureReason bit → human-readable string, in bit order.
const FAILURE_REASONS = [
  'accelerated animations disabled', // 1 << 0
  'effect suppressed by DevTools', // 1 << 1
  'invalid animation or effect', // 1 << 2
  'effect has unsupported timing parameters', // 1 << 3
  "effect has composite mode other than 'replace'", // 1 << 4
  'target has invalid compositing state', // 1 << 5
  'target has another incompatible animation', // 1 << 6
  'target has CSS offset', // 1 << 7
  'target has multiple transform properties', // 1 << 8 (retired)
  'animation affects non-CSS properties', // 1 << 9
  'transform-related property cannot be accelerated on target', // 1 << 10
  'transform-related property depends on box size', // 1 << 11 (retired)
  'filter-related property may move pixels', // 1 << 12
  'unsupported CSS property', // 1 << 13
  'multiple transform animations on same target', // 1 << 14 (retired)
  'mixed keyframe value types', // 1 << 15
  'scroll timeline source has invalid compositing state', // 1 << 16
  'animation has no visible change', // 1 << 17
  'animation affects an !important property', // 1 << 18
  'SVG target has independent transform property', // 1 << 19
  "effect has iteration composite mode other than 'replace'" // 1 << 20
];

function decodeFailureReasons(bitmask) {
  const reasons = [];
  for (let bit = 0; bitmask >> bit > 0; bit++) {
    if (((bitmask >> bit) & 1) === 0) continue;
    reasons.push(FAILURE_REASONS[bit] || `unknown reason (bit ${bit})`);
  }
  return reasons;
}

export function computeNonCompositedAnimations(trace) {
  const seen = new Set();
  const animations = [];

  for (const event of trace.traceEvents) {
    if (event.name !== 'Animation') continue;
    // Animation events fire at multiple phases; the compositeFailed
    // bitmask is set once per animation lifecycle. Dedupe by id so we
    // don't list the same failed animation N times.
    const data = (event.args && event.args.data) || {};
    const failed = data.compositeFailed || 0;
    const unsupported = data.unsupportedProperties || [];
    if (!failed && unsupported.length === 0) continue;

    const id = data.id || `${event.ts}`;
    if (seen.has(id)) continue;
    seen.add(id);

    animations.push({
      name: data.nodeName || '',
      id: data.id || '',
      compositeFailed: failed,
      failureReasons: decodeFailureReasons(failed),
      unsupportedProperties: unsupported,
      startTime: event.ts
    });
  }

  return animations;
}
