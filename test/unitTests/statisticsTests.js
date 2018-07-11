'use strict';

let assert = require('assert'),
  Statistics = require('../../lib/support/statistics').Statistics;

describe('statistics', function() {
  let stats;

  beforeEach(function() {
    stats = new Statistics();
  });

  describe('#add', function() {
    it('should be possible to add multiple keys', function() {
      for (let i = 0; i < 11; i++) {
        stats.add('foo', i + 1);
        stats.add('bar', 11 - i);
      }
      let result = stats.summarize();
      assert.deepEqual(result.foo, result.bar);
    });

    it('should handle keys with dots', function() {
      stats.add('1.2.3', 42.0);
      let result = stats.summarize();
      assert.deepEqual(result['1.2.3'].mean, 42.0);
    });

    it('should require string keys', function() {
      assert.throws(function() {
        stats.add(3, 3);
      }, TypeError);
    });

    it('should require numeric values', function() {
      assert.throws(function() {
        stats.add('a', 'a');
      }, TypeError);
    });

    it('should require finite values', function() {
      assert.throws(function() {
        stats.add('a', NaN);
      }, RangeError);
      assert.throws(function() {
        stats.add('a', Infinity);
      }, RangeError);
    });
  });

  describe('#addAll', function() {
    it('should be possible to add an object with numeric values', function() {
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
      assert.deepEqual(result.a, result.c);
      assert.equal(result.a.mean, result.b.mean);
    });

    it('should be possible to add an array of objects with numeric values', function() {
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
      assert.equal(3, Object.keys(result).length);
      assert.deepEqual(result.a, result.c);
      assert.equal(result.a.mean, result.b.mean);
    });
  });

  describe('#addDeep', function() {
    it('should be possible to add a deep structure', function() {
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
      assert.deepEqual(result.a, result.b.d);
      assert.equal(result.b.c.mean, result.b.d.mean);
      assert.equal(result.userTimings.marks['timing.good.times'].max, 123.456);
    });
  });

  describe('#summarize', function() {
    it('should summarize correctly', function() {
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
      assert.equal(1, result.a.min);
      assert.equal(3, result.a.max);
      assert.equal(2, result.a.mean);
      assert.equal(2, result.a.median);
      assert.equal(result.a.mean, result.b.mean);
      assert.deepEqual(result.a, result.c);
    });

    it('should summarize specified percentiles', function() {
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
      assert.equal(1, result.a.min);
      assert.equal(3, result.a.p99);
      assert.equal(null, result.a.p90);
      assert.equal(3, result.a.p99_9);
      assert.equal(2, result.a.mean);
      assert.equal(2, result.a.median);
    });
  });
});
