import test from 'ava';
import { computeBlockingTime } from '../../lib/chrome/trace/blocking-time.js';
import { computeDomainBreakdown } from '../../lib/chrome/trace/domain-breakdown.js';

const PID = 1;
const TID = 2;
const FRAME = 'FRAME0';

// Minimal-but-valid Chrome trace: enough metadata for trace-of-tab to
// resolve pid/tid/frame, a navigationStart, three top-level tasks
// longer than 50 ms (one attributed via a nested child, one after the
// LCP candidate, one with no attributable URL) and one short task.
function syntheticTrace({ withLcp = true, withParseHtml = false } = {}) {
  const traceEvents = [
    {
      name: 'TracingStartedInBrowser',
      cat: 'disabled-by-default-devtools.timeline',
      ph: 'I',
      pid: 100,
      tid: 100,
      ts: 900_000,
      args: { data: { frames: [{ frame: FRAME, processId: PID }] } }
    },
    {
      name: 'thread_name',
      cat: '__metadata',
      ph: 'M',
      pid: PID,
      tid: TID,
      ts: 0,
      args: { name: 'CrRendererMain' }
    },
    {
      name: 'navigationStart',
      cat: 'blink.user_timing',
      ph: 'R',
      pid: PID,
      tid: TID,
      ts: 1_000_000,
      args: {
        frame: FRAME,
        data: { documentLoaderURL: 'https://en.first.example/page' }
      }
    },
    {
      name: 'EvaluateScript',
      cat: 'devtools.timeline',
      ph: 'X',
      pid: PID,
      tid: TID,
      ts: 1_050_000,
      dur: 30_000,
      args: { data: { url: 'https://cdn.third.example/lib.js' } }
    },
    {
      name: 'RunTask',
      cat: 'disabled-by-default-devtools.timeline',
      ph: 'X',
      pid: PID,
      tid: TID,
      ts: 1_100_000,
      dur: 200_000,
      args: {}
    },
    {
      name: 'EvaluateScript',
      cat: 'devtools.timeline',
      ph: 'X',
      pid: PID,
      tid: TID,
      ts: 1_110_000,
      dur: 150_000,
      args: { data: { url: 'https://sub.first.example/app.js' } }
    },
    {
      name: 'EvaluateScript',
      cat: 'devtools.timeline',
      ph: 'X',
      pid: PID,
      tid: TID,
      ts: 1_500_000,
      dur: 130_000,
      args: { data: { url: 'https://cdn.third.example/lib.js' } }
    },
    {
      name: 'Layout',
      cat: 'devtools.timeline',
      ph: 'X',
      pid: PID,
      tid: TID,
      ts: 1_700_000,
      dur: 90_000,
      args: {}
    }
  ];
  if (withLcp) {
    traceEvents.push({
      name: 'largestContentfulPaint::Candidate',
      cat: 'loading,rail,devtools.timeline',
      ph: 'R',
      pid: PID,
      tid: TID,
      ts: 1_400_000,
      args: { frame: FRAME, data: {} }
    });
  }
  if (withParseHtml) {
    // ParseHTML carries no attributable URL, only the document URL in
    // args.beginData.url.
    traceEvents.push({
      name: 'ParseHTML',
      cat: 'devtools.timeline',
      ph: 'X',
      pid: PID,
      tid: TID,
      ts: 1_800_000,
      dur: 70_000,
      args: { beginData: { url: 'https://en.first.example/page' } }
    });
  }
  return { traceEvents };
}

test('blocking time is attributed to the dominant URL in the task subtree', t => {
  const result = computeBlockingTime(syntheticTrace());

  t.is(result.totalBlockingTime, 270);
  t.is(result.tasks, 3);
  t.deepEqual(result.urls, [
    { url: 'https://sub.first.example/app.js', value: 150, tasks: 1 },
    { url: 'https://cdn.third.example/lib.js', value: 80, tasks: 1 },
    { url: 'unknown', value: 40, tasks: 1 }
  ]);
});

test('blocking time is split by kind of work, scaled to the blocking share', t => {
  const result = computeBlockingTime(syntheticTrace());

  // The 200 ms RunTask (150 ms blocking) is 150 ms script self-time
  // and 50 ms wrapper self-time: 150/200 and 50/200 of its blocking.
  t.deepEqual(result.kinds, {
    scriptEvaluation: 192.5,
    styleLayout: 40,
    other: 37.5
  });
});

test('HTML parsing is attributed to the document and split out as a kind', t => {
  const result = computeBlockingTime(syntheticTrace({ withParseHtml: true }));

  t.is(result.totalBlockingTime, 290);
  t.deepEqual(
    result.urls.find(u => u.url === 'https://en.first.example/page'),
    { url: 'https://en.first.example/page', value: 20, tasks: 1 }
  );
  t.is(result.kinds.parseHTML, 20);
});

test('blocking time before LCP only counts tasks in the navigationStart to LCP window', t => {
  const result = computeBlockingTime(syntheticTrace());

  t.deepEqual(result.beforeLargestContentfulPaint, {
    totalBlockingTime: 150,
    tasks: 1,
    urls: [{ url: 'https://sub.first.example/app.js', value: 150, tasks: 1 }],
    kinds: { scriptEvaluation: 112.5, other: 37.5 }
  });
});

test('the LCP window is omitted when the trace has no LCP candidate', t => {
  const result = computeBlockingTime(syntheticTrace({ withLcp: false }));

  t.is(result.totalBlockingTime, 270);
  t.false('beforeLargestContentfulPaint' in result);
});

test('domain breakdown separates first-party subdomains from third parties', t => {
  const result = computeDomainBreakdown(
    syntheticTrace(),
    'https://en.first.example/page'
  );

  t.is(result.firstPartyDomain, 'first.example');
  t.is(result.firstParty, 150);
  t.is(result.thirdParty, 160);
  t.deepEqual(result.domains, [
    { domain: 'third.example', value: 160, firstParty: false },
    { domain: 'first.example', value: 150, firstParty: true }
  ]);
});
