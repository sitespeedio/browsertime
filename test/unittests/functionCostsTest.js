import test from 'ava';
import { computeFunctionCosts } from '../../lib/chrome/trace/function-costs.js';
import { resourceLoaderLocationResolver } from '../../lib/chrome/mediawikiResourceLoader.js';

const PID = 1;
const TID = 2;
const FRAME = 'FRAME0';
const PROFILE_ID = '0x1';

const BUNDLE_URL = 'https://en.example.org/w/load.php?modules=a|b';
const PLAIN_URL = 'https://en.example.org/w/plain.js';

// line 1: preamble, line 2: module.one, line 3: module.two
const bundleSource =
  '/* preamble */\n' +
  'mw.loader.impl(function(){return["module.one@abc12",function(){}];});\n' +
  'mw.loader.impl(function(){return["module.two@def34",function(){}];});';

function metadataEvents() {
  return [
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
    }
  ];
}

// Call tree: (root) → outer (bundle, module.one) → inner (plain.js)
//            (root) → (garbage collector)
// V8 callFrame positions are 0-based: line 1 col 0 is bundle line 2.
function profileEvents() {
  return [
    {
      name: 'Profile',
      cat: 'disabled-by-default-v8.cpu_profiler',
      ph: 'P',
      id: PROFILE_ID,
      pid: PID,
      tid: TID,
      ts: 1_000_000,
      args: { data: { startTime: 1_000_000 } }
    },
    {
      name: 'ProfileChunk',
      cat: 'disabled-by-default-v8.cpu_profiler',
      ph: 'P',
      id: PROFILE_ID,
      pid: PID,
      tid: 999, // chunks arrive on the sampling thread
      ts: 1_000_100,
      args: {
        data: {
          cpuProfile: {
            nodes: [
              {
                id: 1,
                callFrame: {
                  functionName: '(root)',
                  scriptId: 0,
                  codeType: 'other'
                }
              },
              {
                id: 2,
                parent: 1,
                callFrame: {
                  functionName: 'outer',
                  scriptId: 5,
                  codeType: 'JS',
                  url: BUNDLE_URL,
                  lineNumber: 1,
                  columnNumber: 0
                }
              },
              {
                id: 3,
                parent: 2,
                callFrame: {
                  functionName: 'inner',
                  scriptId: 6,
                  codeType: 'JS',
                  url: PLAIN_URL,
                  lineNumber: 9,
                  columnNumber: 4
                }
              },
              {
                id: 4,
                parent: 1,
                callFrame: {
                  functionName: '(garbage collector)',
                  scriptId: 0,
                  codeType: 'other'
                }
              }
            ],
            samples: [2, 3, 3, 4]
          },
          timeDeltas: [1000, 2000, 1500, 800]
        }
      }
    },
    {
      name: 'ProfileChunk',
      cat: 'disabled-by-default-v8.cpu_profiler',
      ph: 'P',
      id: PROFILE_ID,
      pid: PID,
      tid: 999,
      ts: 1_001_000,
      args: {
        data: {
          cpuProfile: { samples: [2, 3] },
          timeDeltas: [500, 1200]
        }
      }
    }
  ];
}

function syntheticTrace(extraEvents = []) {
  return {
    traceEvents: [...metadataEvents(), ...profileEvents(), ...extraEvents]
  };
}

test('aggregates self and total time per function across chunks', t => {
  const costs = computeFunctionCosts(syntheticTrace());

  // inner: samples 2000 + 1500 + 1200 = 4.7 ms self, no children so
  // total equals self. outer: 1000 + 500 = 1.5 ms self; total adds
  // inner's stacks = 6.2 ms. GC and (root) are meta frames → skipped.
  t.deepEqual(
    costs.map(c => ({
      functionName: c.functionName,
      selfTime: c.selfTime,
      totalTime: c.totalTime
    })),
    [
      { functionName: 'inner', selfTime: 4.7, totalTime: 4.7 },
      { functionName: 'outer', selfTime: 1.5, totalTime: 6.2 }
    ]
  );

  // Positions are reported 1-based (trace event / DevTools convention).
  const inner = costs.find(c => c.functionName === 'inner');
  t.is(inner.url, PLAIN_URL);
  t.is(inner.line, 10);
  t.is(inner.column, 5);
});

test('resolves bundle frames to the owning module', t => {
  const bundles = new Map([
    [BUNDLE_URL, resourceLoaderLocationResolver(bundleSource)]
  ]);
  const costs = computeFunctionCosts(syntheticTrace(), bundles);

  const outer = costs.find(c => c.functionName === 'outer');
  t.is(outer.module, 'module.one');
  t.is(costs.find(c => c.functionName === 'inner').module, undefined);
});

test('recovers bundle URLs truncated by V8', t => {
  const longBundleUrl = BUNDLE_URL + '&modules=' + 'x'.repeat(1200);
  const truncated = longBundleUrl.slice(0, 1024);
  const trace = syntheticTrace();
  for (const event of trace.traceEvents) {
    for (const node of event.args?.data?.cpuProfile?.nodes || []) {
      if (node.callFrame.url === BUNDLE_URL) {
        node.callFrame.url = truncated;
      }
    }
  }
  const bundles = new Map([
    [longBundleUrl, resourceLoaderLocationResolver(bundleSource)]
  ]);
  const costs = computeFunctionCosts(trace, bundles);

  const outer = costs.find(c => c.functionName === 'outer');
  t.is(outer.url, longBundleUrl);
  t.is(outer.module, 'module.one');
});

test('drops functions below the 1 ms noise limit', t => {
  const trace = syntheticTrace();
  // Rewrite the deltas so outer only collects 0.9 ms of self time
  // (negative deltas are skipped, not credited).
  trace.traceEvents.at(-2).args.data.timeDeltas = [900, 2000, 1500, 800];
  trace.traceEvents.at(-1).args.data.timeDeltas = [-100, 1200];
  const costs = computeFunctionCosts(trace);
  t.deepEqual(
    costs.map(c => c.functionName),
    ['inner']
  );
});

test('ignores profiles from other processes', t => {
  const trace = syntheticTrace();
  for (const event of trace.traceEvents) {
    if (event.name === 'Profile' || event.name === 'ProfileChunk') {
      event.pid = 55;
    }
  }
  t.deepEqual(computeFunctionCosts(trace), []);
});

test('returns empty when the trace has no profiler data', t => {
  const trace = { traceEvents: metadataEvents() };
  t.deepEqual(computeFunctionCosts(trace), []);
});
