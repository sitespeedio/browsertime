import test from 'ava';
import { paintJsCoverage } from '../../lib/chrome/coverage.js';
import {
  isResourceLoaderBundle,
  resourceLoaderModuleCoverage
} from '../../lib/chrome/mediawikiResourceLoader.js';

const preamble = '/* preamble */\n';
const moduleOne =
  'mw.loader.impl(function(){return["module.one@abc12",function(){}];});\n';
const moduleTwo =
  'mw.loader.impl(function(){return["module.two@def34",function(){}];});\n';
const moduleThree =
  'mw.loader.impl(function(){return["module.three@gh567",function(){}];});';
const bundle = preamble + moduleOne + moduleTwo + moduleThree;

const oneStart = preamble.length;
const twoStart = oneStart + moduleOne.length;
const threeStart = twoStart + moduleTwo.length;

function allUsed(totalBytes) {
  return paintJsCoverage(
    {
      functions: [
        { ranges: [{ startOffset: 0, endOffset: totalBytes, count: 1 }] }
      ]
    },
    totalBytes
  );
}

test('detects bundles by load.php URL or source sniff', t => {
  t.true(isResourceLoaderBundle('https://en.wikipedia.org/w/load.php', ''));
  t.true(isResourceLoaderBundle('https://example.com/a.js', bundle.slice(15)));
  t.false(isResourceLoaderBundle('https://example.com/a.js', 'var a = 1;'));
});

test('splits a bundle into per-module byte buckets', t => {
  // module.one fully used, module.two fully unused, module.three half
  // used, preamble fully used.
  const painted = paintJsCoverage(
    {
      functions: [
        { ranges: [{ startOffset: 0, endOffset: twoStart, count: 1 }] },
        {
          ranges: [{ startOffset: twoStart, endOffset: threeStart, count: 0 }]
        },
        {
          ranges: [
            { startOffset: threeStart, endOffset: threeStart + 36, count: 2 },
            { startOffset: threeStart + 36, endOffset: bundle.length, count: 0 }
          ]
        }
      ]
    },
    bundle.length
  );
  const modules = resourceLoaderModuleCoverage(bundle, painted);
  t.is(modules.length, 4);

  const byName = new Map(modules.map(m => [m.name, m]));
  t.deepEqual(byName.get('(preamble)'), {
    name: '(preamble)',
    version: '',
    totalBytes: preamble.length,
    usedBytes: preamble.length,
    unusedBytes: 0,
    unusedPercent: 0
  });
  t.deepEqual(byName.get('module.one'), {
    name: 'module.one',
    version: 'abc12',
    totalBytes: moduleOne.length,
    usedBytes: moduleOne.length,
    unusedBytes: 0,
    unusedPercent: 0
  });
  t.deepEqual(byName.get('module.two'), {
    name: 'module.two',
    version: 'def34',
    totalBytes: moduleTwo.length,
    usedBytes: 0,
    unusedBytes: moduleTwo.length,
    unusedPercent: 100
  });
  t.is(byName.get('module.three').version, 'gh567');
  t.is(byName.get('module.three').totalBytes, moduleThree.length);
  t.is(byName.get('module.three').usedBytes, 36);
  t.is(byName.get('module.three').unusedBytes, moduleThree.length - 36);

  const unused = modules.map(m => m.unusedBytes);
  t.deepEqual(
    unused,
    unused.toSorted((a, b) => b - a)
  );
});

test('module totals add up to the bundle size', t => {
  const modules = resourceLoaderModuleCoverage(bundle, allUsed(bundle.length));
  let total = 0;
  for (const m of modules) total += m.totalBytes;
  t.is(total, bundle.length);
});

test('bundle without a preamble gets no preamble bucket', t => {
  const source = moduleOne + moduleTwo;
  const modules = resourceLoaderModuleCoverage(source, allUsed(source.length));
  t.deepEqual(modules.map(m => m.name).toSorted(), [
    'module.one',
    'module.two'
  ]);
});

test('source without delimiters returns no modules', t => {
  const source = 'var a = 1; console.log(a);';
  t.is(resourceLoaderModuleCoverage(source, allUsed(source.length)), undefined);
});

test('delimiter inside a string literal mid-line is not a module', t => {
  const source =
    moduleOne +
    'var s = "mw.loader.impl(function(){return[\\"phantom@xxxxx\\","; f(s);\n';
  const modules = resourceLoaderModuleCoverage(source, allUsed(source.length));
  t.deepEqual(
    modules.map(m => m.name),
    ['module.one']
  );
});
