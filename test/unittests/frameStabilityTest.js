import test from 'ava';
import { computeFrameStability } from '../../lib/chrome/trace/frame-stability.js';

const PID = 1;
const TID = 2;
const NAV_START = 10_000;

function makeTrace(pipelineEvents) {
  return {
    traceEvents: [
      {
        name: 'TracingStartedInBrowser',
        cat: 'disabled-by-default-devtools.timeline',
        ph: 'I',
        pid: 9,
        tid: 9,
        ts: 1000,
        args: { data: { frames: [{ frame: 'F1', processId: PID }] } }
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
        ts: NAV_START,
        args: {
          frame: 'F1',
          data: {
            documentLoaderURL: 'https://example.com',
            isLoadingMainFrame: true
          }
        }
      },
      ...pipelineEvents
    ]
  };
}

function reporter(
  id,
  state,
  { sequence, beginTs, endTs, affectsSmoothness = false, pid = PID } = {}
) {
  const cat = 'cc,benchmark,disabled-by-default-devtools.timeline.frame';
  return [
    {
      name: 'PipelineReporter',
      cat,
      ph: 'b',
      pid,
      tid: 3,
      ts: beginTs,
      id2: { local: id },
      args: {
        frame_reporter: {
          frame_sequence: sequence,
          state,
          affects_smoothness: affectsSmoothness
        }
      }
    },
    {
      name: 'PipelineReporter',
      cat,
      ph: 'e',
      pid,
      tid: 3,
      ts: endTs,
      id2: { local: id },
      args: {}
    }
  ];
}

test('counts presented frames, fps and the longest gap', t => {
  const trace = makeTrace([
    ...reporter('0x1', 'STATE_PRESENTED_ALL', {
      sequence: 1,
      beginTs: 100_000,
      endTs: 110_000
    }),
    ...reporter('0x2', 'STATE_PRESENTED_ALL', {
      sequence: 2,
      beginTs: 116_000,
      endTs: 126_667
    }),
    ...reporter('0x3', 'STATE_PRESENTED_ALL', {
      sequence: 3,
      beginTs: 200_000,
      endTs: 210_000
    })
  ]);
  const result = computeFrameStability(trace);
  t.is(result.presented, 3);
  t.is(result.partial, 0);
  t.is(result.dropped, 0);
  t.is(result.effectiveFps, 20);
  t.deepEqual(result.longestGap, { duration: 83.3, startTime: 116.7 });
});

test('only dropped frames affecting smoothness count as dropped', t => {
  const trace = makeTrace([
    ...reporter('0x1', 'STATE_DROPPED', {
      sequence: 1,
      beginTs: 100_000,
      endTs: 110_000,
      affectsSmoothness: true
    }),
    ...reporter('0x2', 'STATE_DROPPED', {
      sequence: 2,
      beginTs: 116_000,
      endTs: 126_000
    }),
    ...reporter('0x3', 'STATE_NO_UPDATE_DESIRED', {
      sequence: 3,
      beginTs: 132_000,
      endTs: 142_000
    })
  ]);
  const result = computeFrameStability(trace);
  t.is(result.presented, 0);
  t.is(result.dropped, 1);
  t.is(result.effectiveFps, undefined);
  t.is(result.longestGap, undefined);
});

test('forked reporters for the same frame sequence are merged', t => {
  const trace = makeTrace([
    ...reporter('0x1', 'STATE_DROPPED', {
      sequence: 1,
      beginTs: 100_000,
      endTs: 108_000,
      affectsSmoothness: true
    }),
    ...reporter('0x2', 'STATE_PRESENTED_ALL', {
      sequence: 1,
      beginTs: 100_000,
      endTs: 110_000
    }),
    ...reporter('0x3', 'STATE_PRESENTED_PARTIAL', {
      sequence: 2,
      beginTs: 116_000,
      endTs: 126_000
    })
  ]);
  const result = computeFrameStability(trace);
  t.is(result.presented, 2);
  t.is(result.partial, 1);
  t.is(result.dropped, 0);
});

test('frames presented before navigationStart or in other processes are ignored', t => {
  const trace = makeTrace([
    ...reporter('0x1', 'STATE_PRESENTED_ALL', {
      sequence: 1,
      beginTs: 2000,
      endTs: 9000
    }),
    ...reporter('0x2', 'STATE_PRESENTED_ALL', {
      sequence: 2,
      beginTs: 100_000,
      endTs: 110_000,
      pid: 9
    }),
    ...reporter('0x3', 'STATE_PRESENTED_ALL', {
      sequence: 3,
      beginTs: 100_000,
      endTs: 110_000
    })
  ]);
  const result = computeFrameStability(trace);
  t.is(result.presented, 1);
  t.is(result.effectiveFps, undefined);
  t.is(result.longestGap, undefined);
});
