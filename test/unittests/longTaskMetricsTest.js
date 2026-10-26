import test from 'ava';

import { longTaskMetrics } from '../../lib/chrome/longTaskMetrics.js';

function result(longTask, softNavigations) {
  return {
    browserScripts: {
      timings: {
        paintTiming: { 'first-contentful-paint': 40 },
        softNavigations
      },
      pageinfo: { longTask }
    }
  };
}

const tasks = [
  { startTime: 1000, duration: 250, navigationId: 'hard' },
  { startTime: 5000, duration: 250, navigationId: 'route-one' },
  { startTime: 9000, duration: 250, navigationId: 'route-two' }
];

test('Total Blocking Time uses every long task after FCP for a page load', t => {
  const cpu = longTaskMetrics(result([{ startTime: 1000, duration: 250 }]), {});
  t.is(cpu.longTasks.totalBlockingTime, 200);
});

test('Total Blocking Time only uses the long tasks of the soft navigation', t => {
  const cpu = longTaskMetrics(
    result(tasks, [{ navigationId: 'route-two', startTime: 8950 }]),
    {}
  );
  t.is(cpu.longTasks.tasks, 1);
  t.is(cpu.longTasks.totalBlockingTime, 200);
  t.is(cpu.longTasks.lastLongTask, 50);
});

test('Soft navigation long tasks without navigationId use the start time', t => {
  const cpu = longTaskMetrics(
    result(
      tasks.map(({ startTime, duration }) => ({ startTime, duration })),
      [{ navigationId: 'route-two', startTime: 8950 }]
    ),
    {}
  );
  t.is(cpu.longTasks.tasks, 1);
  t.is(cpu.longTasks.totalBlockingTime, 200);
});
