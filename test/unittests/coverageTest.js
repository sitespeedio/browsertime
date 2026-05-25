import test from 'ava';
import { usedJsBytes } from '../../lib/chrome/coverage.js';

test('whole function used — single range, count > 0', t => {
  t.is(
    usedJsBytes(
      {
        functions: [{ ranges: [{ startOffset: 0, endOffset: 100, count: 5 }] }]
      },
      100
    ),
    100
  );
});

test('whole function unused — single range, count = 0', t => {
  t.is(
    usedJsBytes(
      {
        functions: [{ ranges: [{ startOffset: 0, endOffset: 100, count: 0 }] }]
      },
      100
    ),
    0
  );
});

test('function called with dead branch — inner count=0 punches a hole', t => {
  // The bug case: the outer range alone would mark the whole function as
  // used, masking the inner dead branch. Innermost-wins must keep the
  // 30..50 hole.
  t.is(
    usedJsBytes(
      {
        functions: [
          {
            ranges: [
              { startOffset: 0, endOffset: 100, count: 5 },
              { startOffset: 30, endOffset: 50, count: 0 }
            ]
          }
        ]
      },
      100
    ),
    80
  );
});

test('two sibling functions — one executed, one not', t => {
  t.is(
    usedJsBytes(
      {
        functions: [
          { ranges: [{ startOffset: 0, endOffset: 50, count: 3 }] },
          { ranges: [{ startOffset: 50, endOffset: 100, count: 0 }] }
        ]
      },
      100
    ),
    50
  );
});

test('nested function never called — overrides containing function', t => {
  t.is(
    usedJsBytes(
      {
        functions: [
          { ranges: [{ startOffset: 0, endOffset: 100, count: 5 }] },
          { ranges: [{ startOffset: 30, endOffset: 50, count: 0 }] }
        ]
      },
      100
    ),
    80
  );
});

test('nested function rescued from a containing dead branch', t => {
  // The containing function ran, but it has a dead branch covering
  // 20..60. A nested function whose body is at 35..45 with count > 0
  // must override the dead branch — its bytes are used.
  t.is(
    usedJsBytes(
      {
        functions: [
          {
            ranges: [
              { startOffset: 0, endOffset: 100, count: 5 },
              { startOffset: 20, endOffset: 60, count: 0 }
            ]
          },
          { ranges: [{ startOffset: 35, endOffset: 45, count: 2 }] }
        ]
      },
      100
    ),
    70
  );
});

test('no functions returns zero', t => {
  t.is(usedJsBytes({ functions: [] }, 100), 0);
});

test('empty ranges returns zero', t => {
  t.is(usedJsBytes({ functions: [{ ranges: [] }] }, 100), 0);
});

test('zero-length ranges are ignored', t => {
  t.is(
    usedJsBytes(
      {
        functions: [
          {
            ranges: [
              { startOffset: 0, endOffset: 100, count: 1 },
              { startOffset: 50, endOffset: 50, count: 0 }
            ]
          }
        ]
      },
      100
    ),
    100
  );
});

test('ranges past totalBytes are clamped', t => {
  // A defensive case: V8 returning endOffset > script length must not
  // walk off the end of the typed array.
  t.is(
    usedJsBytes(
      {
        functions: [{ ranges: [{ startOffset: 0, endOffset: 200, count: 1 }] }]
      },
      100
    ),
    100
  );
});
