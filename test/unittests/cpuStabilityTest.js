import test from 'ava';
import {
  parseCpuTimes,
  getCpuStability
} from '../../lib/support/cpuStability.js';

test('Read the total and steal time from /proc/stat', t => {
  const procStat = 'cpu  10 0 5 80 2 0 1 2 7 0\ncpu0 5 0 2 40 1 0 0 1 3 0\n';
  t.deepEqual(parseCpuTimes(procStat), { total: 100, steal: 2 });
});

test('Give the steal time and throttle events between two samples', t => {
  const start = { total: 1000, steal: 10, throttleCount: 3 };
  const end = { total: 1400, steal: 30, throttleCount: 5 };
  t.deepEqual(getCpuStability(start, end), {
    stealPercent: 5,
    throttleCount: 2
  });
});

test('Give no throttle events when the CPU does not report them', t => {
  const start = { total: 1000, steal: 0, throttleCount: undefined };
  const end = { total: 1000, steal: 0, throttleCount: undefined };
  t.deepEqual(getCpuStability(start, end), {
    stealPercent: 0,
    throttleCount: undefined
  });
});
