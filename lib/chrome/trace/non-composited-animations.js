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
 * `unsupportedProperties` strings. We surface the raw values; the
 * consumer can map the bitmask to human reasons (see Lighthouse's
 * non-composited-animations audit for the canonical mapping).
 *
 * Returns: [{ name, id, compositeFailed, unsupportedProperties,
 *             startTime }, …]
 *   name            — args.data.nodeName when present (rare)
 *   id              — args.data.id (compositor-internal)
 *   compositeFailed — bitmask of failure reasons
 *   unsupportedProperties — array of property names that blocked
 *                           composite (e.g. ['top','box-shadow'])
 *   startTime       — event ts in microseconds (raw trace timestamp)
 */

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
      unsupportedProperties: unsupported,
      startTime: event.ts
    });
  }

  return animations;
}
