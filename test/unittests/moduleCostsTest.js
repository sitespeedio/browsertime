import test from 'ava';
import { computeModuleCosts } from '../../lib/chrome/trace/module-costs.js';
import { resourceLoaderLocationResolver } from '../../lib/chrome/mediawikiResourceLoader.js';

const PID = 1;
const TID = 2;
const FRAME = 'FRAME0';

const BUNDLE_URL = 'https://en.example.org/w/load.php?modules=a|b';
const OTHER_URL = 'https://en.example.org/w/other.js';

// line 1: preamble, line 2-4: module.one (multi-line), line 5: module.two
const bundleSource =
  '/* preamble */\n' +
  'mw.loader.impl(function(){return["module.one@abc12",function(){\n' +
  'function one(){}\n' +
  '}];});\n' +
  'mw.loader.impl(function(){return["module.two@def34",function(){}];});';

// Minimal-but-valid trace (same skeleton as traceAnalysisTest.js):
//  - EvaluateScript of the bundle (30 ms) → whole-script → otherTime
//  - RunTask wrapping a FunctionCall defined on bundle line 3 (module.one,
//    60 ms self) with a nested Layout (20 ms) that has no location of its
//    own and inherits the bundle URL → otherTime
//  - EventDispatch whose innermost stack frame is bundle line 5 → module.two
//  - FunctionCall in a non-bundle script → not counted
//  - EventDispatch whose innermost frame is non-bundle code (with a deeper
//    bundle frame) → the innermost URL owns the time → not counted
function syntheticTrace() {
  return {
    traceEvents: [
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
          data: { documentLoaderURL: 'https://en.example.org/wiki/Page' }
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
        args: { data: { url: BUNDLE_URL, lineNumber: 1, columnNumber: 1 } }
      },
      {
        name: 'RunTask',
        cat: 'disabled-by-default-devtools.timeline',
        ph: 'X',
        pid: PID,
        tid: TID,
        ts: 1_100_000,
        dur: 100_000,
        args: {}
      },
      {
        name: 'FunctionCall',
        cat: 'devtools.timeline',
        ph: 'X',
        pid: PID,
        tid: TID,
        ts: 1_110_000,
        dur: 80_000,
        args: {
          data: {
            functionName: 'one',
            url: BUNDLE_URL,
            lineNumber: 3,
            columnNumber: 1
          }
        }
      },
      {
        name: 'Layout',
        cat: 'devtools.timeline',
        ph: 'X',
        pid: PID,
        tid: TID,
        ts: 1_120_000,
        dur: 20_000,
        args: {}
      },
      {
        name: 'EventDispatch',
        cat: 'devtools.timeline',
        ph: 'X',
        pid: PID,
        tid: TID,
        ts: 1_300_000,
        dur: 40_000,
        args: {
          data: {
            type: 'click',
            stackTrace: [
              { url: BUNDLE_URL, lineNumber: 5, columnNumber: 10 },
              { url: OTHER_URL, lineNumber: 1, columnNumber: 1 }
            ]
          }
        }
      },
      {
        name: 'FunctionCall',
        cat: 'devtools.timeline',
        ph: 'X',
        pid: PID,
        tid: TID,
        ts: 1_400_000,
        dur: 50_000,
        args: {
          data: { url: OTHER_URL, lineNumber: 1, columnNumber: 1 }
        }
      },
      {
        name: 'EventDispatch',
        cat: 'devtools.timeline',
        ph: 'X',
        pid: PID,
        tid: TID,
        ts: 1_500_000,
        dur: 10_000,
        args: {
          data: {
            type: 'click',
            stackTrace: [
              { url: OTHER_URL, lineNumber: 1, columnNumber: 1 },
              { url: BUNDLE_URL, lineNumber: 3, columnNumber: 1 }
            ]
          }
        }
      }
    ]
  };
}

function bundles() {
  return new Map([[BUNDLE_URL, resourceLoaderLocationResolver(bundleSource)]]);
}

test('module CPU is attributed via frame line/column into the bundle', t => {
  const result = computeModuleCosts(syntheticTrace(), bundles());

  t.deepEqual(result, [
    {
      url: BUNDLE_URL,
      modules: [
        { name: 'module.one', version: 'abc12', selfTime: 60 },
        { name: 'module.two', version: 'def34', selfTime: 40 }
      ],
      // EvaluateScript (whole script, 30 ms) + inherited Layout (20 ms).
      otherTime: 50
    }
  ]);
});

test('per-bundle module time never exceeds the bundle total', t => {
  const result = computeModuleCosts(syntheticTrace(), bundles());
  const bundle = result[0];
  let sum = bundle.otherTime;
  for (const m of bundle.modules) sum += m.selfTime;
  // EvaluateScript 30 + FunctionCall 60 + Layout 20 + EventDispatch 40:
  // exactly the trace time spent inside the bundle. The out-of-bundle
  // FunctionCall (50 ms) and the EventDispatch owned by other.js (10 ms)
  // are excluded.
  t.is(sum, 150);
});

test('no bundles means no result and no work', t => {
  t.deepEqual(computeModuleCosts(syntheticTrace(), new Map()), []);
  t.deepEqual(computeModuleCosts(syntheticTrace()), []);
});
