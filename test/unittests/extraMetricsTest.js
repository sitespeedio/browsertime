import test from 'ava';
import { extraMetrics } from '../../lib/video/postprocessing/visualmetrics/extraMetrics.js';

test('VisualComplete milestones come from the visual progress curve', t => {
  const { visualMetrics } = extraMetrics({
    FirstVisualChange: 500,
    LastVisualChange: 2000,
    VisualProgress: '0=0, 500=80, 1000=90, 1500=96, 2000=100'
  });
  t.is(visualMetrics.VisualComplete85, 1000);
  t.is(visualMetrics.VisualComplete95, 1500);
  t.is(visualMetrics.VisualComplete99, 2000);
});

test('VisualReadiness is Last minus First Visual Change', t => {
  const { visualMetrics } = extraMetrics({
    FirstVisualChange: 500,
    LastVisualChange: 2000,
    VisualProgress: '0=0, 2000=100'
  });
  t.is(visualMetrics.VisualReadiness, 1500);
});

test('painting backward re-finds every milestone above the drop', t => {
  // Reaches 100% at 1000ms, repaints back to 80% at 1500ms, then jumps
  // straight back to 100% at 3000ms. Every milestone must move to 3000 —
  // a stale VisualComplete99 from the first climb would report 99%
  // complete before 95%, which is impossible.
  const { visualMetrics } = extraMetrics({
    FirstVisualChange: 500,
    LastVisualChange: 3000,
    VisualProgress: '0=0, 500=90, 1000=100, 1500=80, 3000=100'
  });
  t.is(visualMetrics.VisualComplete85, 3000);
  t.is(visualMetrics.VisualComplete95, 3000);
  t.is(visualMetrics.VisualComplete99, 3000);
  t.true(visualMetrics.VisualComplete99 >= visualMetrics.VisualComplete95);
});

test('a dip below 95 only re-finds 95 and 99, not 85', t => {
  const { visualMetrics } = extraMetrics({
    FirstVisualChange: 500,
    LastVisualChange: 3000,
    VisualProgress: '0=0, 500=90, 1000=99, 1500=90, 3000=100'
  });
  t.is(visualMetrics.VisualComplete85, 500);
  t.is(visualMetrics.VisualComplete95, 3000);
  t.is(visualMetrics.VisualComplete99, 3000);
});
