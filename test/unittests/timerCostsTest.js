import test from 'ava';
import { computeTimerCosts } from '../../lib/chrome/trace/timer-costs.js';

const PID = 1;
const TID = 2;
const FRAME = 'FRAME0';
const SCRIPT_URL = 'https://en.example.org/w/app.js';

// Same minimal-but-valid skeleton as moduleCostsTest: enough metadata
// for trace-of-tab, one script task that installs a timer (instant
// event inside it), and a later TimerFire task that main-thread-tasks
// attributes back to the installing script.
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
        args: { data: { url: SCRIPT_URL } }
      },
      {
        name: 'TimerInstall',
        cat: 'devtools.timeline',
        ph: 'I',
        pid: PID,
        tid: TID,
        ts: 1_060_000,
        args: {
          data: {
            timerId: 7,
            timeout: 0,
            singleShot: false,
            stackTrace: [{ url: SCRIPT_URL, lineNumber: 1, columnNumber: 1 }]
          }
        }
      },
      {
        name: 'TimerFire',
        cat: 'devtools.timeline',
        ph: 'X',
        pid: PID,
        tid: TID,
        ts: 1_200_000,
        dur: 25_000,
        args: { data: { timerId: 7 } }
      }
    ]
  };
}

test('joins timer installs with the cost of firing them', t => {
  const result = computeTimerCosts(syntheticTrace());

  t.is(result.installs, 1);
  t.is(result.fires, 1);
  t.is(result.fireTime, 25);
  t.is(result.timeoutZeroInstalls, 1);
  t.is(result.recurringInstalls, 1);
  t.deepEqual(result.byUrl, [
    {
      url: SCRIPT_URL,
      installs: 1,
      fires: 1,
      fireTime: 25,
      timeoutZeroInstalls: 1,
      recurringInstalls: 1
    }
  ]);
});

test('returns undefined when the trace has no timer events', t => {
  const trace = syntheticTrace();
  trace.traceEvents = trace.traceEvents.filter(
    e => e.name !== 'TimerInstall' && e.name !== 'TimerFire'
  );
  t.is(computeTimerCosts(trace), undefined);
});
