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
export function computeNonCompositedAnimations(trace: any): {
    name: any;
    id: any;
    compositeFailed: any;
    unsupportedProperties: any;
    startTime: any;
}[];
//# sourceMappingURL=non-composited-animations.d.ts.map