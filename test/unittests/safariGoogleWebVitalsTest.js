import test from 'ava';
import { Safari } from '../../lib/safari/webdriver/safari.js';

function result(timings) {
  return { browserScripts: { timings, pageinfo: {} } };
}

test('Safari sets LCP, FCP and TTFB as googleWebVitals', async t => {
  const safari = new Safari({}, {});
  const r = result({
    ttfb: 120,
    paintTiming: { 'first-contentful-paint': 400 },
    largestContentfulPaint: { renderTime: 900, loadTime: 850 }
  });
  await safari.afterEachURL(undefined, 0, r);
  t.deepEqual(r.googleWebVitals, {
    largestContentfulPaint: 900,
    firstContentfulPaint: 400,
    ttfb: 120
  });
});

test('Safari uses the load time when LCP has no render time', async t => {
  // A cross-origin image without Timing-Allow-Origin has renderTime 0
  const safari = new Safari({}, {});
  const r = result({
    largestContentfulPaint: { renderTime: 0, loadTime: 850 }
  });
  await safari.afterEachURL(undefined, 0, r);
  t.is(r.googleWebVitals.largestContentfulPaint, 850);
});

test('Safari sets no googleWebVitals that it did not measure', async t => {
  const safari = new Safari({}, {});
  const r = result({});
  await safari.afterEachURL(undefined, 0, r);
  t.deepEqual(r.googleWebVitals, {});
});
