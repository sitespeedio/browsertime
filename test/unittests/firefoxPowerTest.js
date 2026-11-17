import test from 'ava';
import { computeFullProfilePower } from '../../lib/firefox/geckoProfiler.js';

// The first sample is not used, so two samples of 2e12 pWh give 4 Wh
function powerCounter(name) {
  return {
    category: 'power',
    name,
    samples: {
      schema: { count: 1 },
      data: [
        [0, 9e12],
        [1, 2e12],
        [2, 2e12]
      ]
    }
  };
}

test('Sum the power of the profile and its sub processes', t => {
  const profile = {
    counters: [powerCounter('Power: CPU package'), powerCounter('Power: DRAM')],
    processes: [
      { counters: [powerCounter('Power: CPU package')], processes: [] }
    ]
  };
  t.is(computeFullProfilePower(profile), 8);
});

test('Give no power for a profile without power counters', t => {
  t.is(computeFullProfilePower({ processes: [{}] }), undefined);
  t.is(computeFullProfilePower({ counters: [], processes: [] }), undefined);
});
