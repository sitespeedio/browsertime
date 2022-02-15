const test = require('ava');
const Statistics = require('../../lib/support/statistics').Statistics;

let stats;

test.serial('Add multiple keys', t => {
  stats = new Statistics();
  for (let i = 0; i < 11; i++) {
    stats.add('foo', i + 1);
    stats.add('bar', 11 - i);
  }
  let result = stats.summarize();
  t.deepEqual(result.foo, result.bar);
});

test('Handle keys with dots', t => {
  stats = new Statistics();
  stats.add('1.2.3', 42.0);
  let result = stats.summarize();
  t.deepEqual(result['1.2.3'].mean, 42.0);
});

test('Require string keys', t => {
  stats = new Statistics();
  t.throws(
    () => {
      stats.add(3, 3);
    },
    { instanceOf: TypeError }
  );
});

test('Require numeric values', t => {
  stats = new Statistics();
  t.throws(
    () => {
      stats.add('a', 'a');
    },
    { instanceOf: TypeError }
  );
});

test('Require finite values', t => {
  stats = new Statistics();
  t.throws(
    () => {
      stats.add('a', NaN);
    },
    { instanceOf: RangeError }
  );

  t.throws(
    () => {
      stats.add('a', Infinity);
    },
    { instanceOf: RangeError }
  );
});

test('should be possible to add an object with numeric values', t => {
  stats = new Statistics();
  stats.addAll({
    a: 1,
    b: 2,
    c: 3
  });
  stats.addAll({
    a: 2,
    b: 2,
    c: 2
  });
  stats.addAll({
    a: 3,
    b: 2,
    c: 1
  });

  let result = stats.summarize();
  t.deepEqual(result.a, result.c);
  t.is(result.a.mean, result.b.mean);
});

test('should be possible to add an array of objects with numeric values', t => {
  stats = new Statistics();
  let samples = [
    {
      a: 1,
      b: 2,
      c: 3
    },
    {
      a: 2,
      b: 2,
      c: 2
    },
    {
      a: 3,
      b: 2,
      c: 1
    }
  ];
  stats.addAll(samples);

  let result = stats.summarize();
  t.is(3, Object.keys(result).length);
  t.deepEqual(result.a, result.c);
  t.is(result.a.mean, result.b.mean);
});

test('should be possible to add a deep structure', t => {
  stats = new Statistics();
  stats.addDeep({
    a: 1,
    b: {
      c: 2,
      d: 3
    }
  });
  stats.addDeep(
    {
      userTimings: {
        marks: [
          {
            name: 'headerTime',
            startTime: 2457.125
          },
          {
            name: 'logoTime',
            startTime: 2654.805
          },
          {
            name: 'timing.good.times',
            startTime: 123.456
          }
        ],
        measures: []
      }
    },
    (keyPath, value) => {
      const equals = (a1, a2) => JSON.stringify(a1) === JSON.stringify(a2);
      if (equals(keyPath, ['userTimings', 'marks'])) {
        return value.reduce((result, mark) => {
          result[mark.name] = mark.startTime;
          return result;
        }, {});
      } else if (equals(keyPath, ['userTimings', 'measures'])) {
        return value.reduce((result, mark) => {
          result[mark.name] = mark.duration;
          return result;
        }, {});
      }

      return value;
    }
  );
  stats.addDeep({
    a: 3,
    b: {
      c: 2,
      d: 1
    }
  });
  stats.addDeep({
    a: 2,
    b: {
      c: 2,
      d: 2
    }
  });

  let result = stats.summarizeDeep({ decimals: 3 });
  t.deepEqual(result.a, result.b.d);
  t.is(result.b.c.mean, result.b.d.mean);
  t.is(result.userTimings.marks['timing.good.times'].max, 123.456);
});

test('should summarize correctly', t => {
  stats = new Statistics();
  stats.addAll({
    a: 1,
    b: 2,
    c: 3
  });
  stats.addAll({
    a: 2,
    b: 2,
    c: 2
  });
  stats.addAll({
    a: 3,
    b: 2,
    c: 1
  });

  let result = stats.summarize();
  t.is(1, result.a.min);
  t.is(3, result.a.max);
  t.is(2, result.a.mean);
  t.is(2, result.a.median);
  t.is(result.a.mean, result.b.mean);
  t.deepEqual(result.a, result.c);
});

test('should summarize specified percentiles', t => {
  stats = new Statistics();
  stats.addAll({
    a: 1,
    b: 2,
    c: 3
  });
  stats.addAll({
    a: 2,
    b: 2,
    c: 2
  });
  stats.addAll({
    a: 3,
    b: 2,
    c: 1
  });

  let result = stats.summarize({
    percentiles: [0, 99, 99.9]
  });

  t.is(1, result.a.min);
  t.is(3, result.a.p99);
  t.is(undefined, result.a.p90);
  t.is(3, result.a.p99_9);
  t.is(2, result.a.mean);
  t.is(2, result.a.median);
});
