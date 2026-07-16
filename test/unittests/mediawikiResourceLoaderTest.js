import test from 'ava';
import { paintJsCoverage } from '../../lib/chrome/coverage.js';
import {
  isResourceLoaderBundle,
  labelForStyleAttributes,
  labelForUrl,
  resourceLoaderModuleCoverage,
  resourceLoaderLocationResolver
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

const loadPhp = 'https://en.wikipedia.org/w/load.php';

test('labels the startup request', t => {
  t.is(
    labelForUrl(`${loadPhp}?lang=en&modules=startup&only=scripts&raw=1`),
    'load.php[startup]'
  );
});

test('labels the top-queue styles batch', t => {
  t.is(
    labelForUrl(
      `${loadPhp}?lang=en&modules=ext.cite.styles%7Cskins.vector.styles&only=styles&skin=vector-2022`
    ),
    'load.php[styles]'
  );
});

test('labels a single-module styles request with the module name', t => {
  t.is(
    labelForUrl(`${loadPhp}?lang=en&modules=site.styles&only=styles`),
    'load.php[styles:site.styles]'
  );
});

test('labels the big general bundle', t => {
  t.is(
    labelForUrl(
      `${loadPhp}?lang=en&modules=ext.centralNotice.startUp%2CchoiceData%7Cext.echo.centralauth%7Cmediawiki.page.ready&skin=vector-2022&version=1u4qz`
    ),
    'load.php[scripts]'
  );
});

test('version, lang and skin parameters never affect the label', t => {
  const before = labelForUrl(
    `${loadPhp}?lang=en&modules=jquery%7Cmediawiki.base&only=scripts&skin=vector-2022&version=aaaaa`
  );
  const after = labelForUrl(
    `${loadPhp}?lang=sv&modules=jquery%7Cmediawiki.base&only=scripts&skin=minerva&version=bbbbb`
  );
  t.is(before, after);
  t.is(before, 'load.php[scripts:jquery]');
});

test('raw script batches are disambiguated from the general bundle', t => {
  const base = labelForUrl(
    `${loadPhp}?lang=en&modules=jquery%7Cmediawiki.base&only=scripts`
  );
  const general = labelForUrl(
    `${loadPhp}?lang=en&modules=jquery%7Cmediawiki.base&skin=vector-2022`
  );
  t.is(base, 'load.php[scripts:jquery]');
  t.is(general, 'load.php[scripts]');
  t.not(base, general);
});

test('expands packed module lists when picking the first sorted name', t => {
  t.is(
    labelForUrl(
      `${loadPhp}?modules=mediawiki.util%2Cbase%7Cext.popups.main&only=scripts`
    ),
    'load.php[scripts:ext.popups.main]'
  );
});

test('single-module script request is labeled with the module name', t => {
  t.is(
    labelForUrl(`${loadPhp}?modules=ext.popups.main&skin=vector-2022`),
    'load.php[scripts:ext.popups.main]'
  );
});

test('non-ResourceLoader URLs get no label', t => {
  t.is(labelForUrl('https://example.com/a.js'), undefined);
  t.is(labelForUrl('https://example.com/load.php/other'), undefined);
  t.is(
    labelForUrl('https://example.com/download.php?modules=startup'),
    undefined
  );
  t.is(labelForUrl('unknown'), undefined);
  t.is(labelForUrl(''), undefined);
  t.is(labelForUrl(), undefined);
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

test('TemplateStyles dedup key labels an inline stylesheet', t => {
  t.is(
    labelForStyleAttributes([
      'data-mw-deduplicate',
      'TemplateStyles:r981673959'
    ]),
    'TemplateStyles:r981673959'
  );
});

test('suffixed TemplateStyles keys keep the full value as label', t => {
  t.is(
    labelForStyleAttributes([
      'data-mw-deduplicate',
      'TemplateStyles:r1349637415/mw-parser-output/.tmulti'
    ]),
    'TemplateStyles:r1349637415/mw-parser-output/.tmulti'
  );
});

test('dedup key is found among other attributes', t => {
  t.is(
    labelForStyleAttributes([
      'typeof',
      'mw:Extension/templatestyles',
      'data-mw-deduplicate',
      'TemplateStyles:r1043282317',
      'about',
      '#mwt42'
    ]),
    'TemplateStyles:r1043282317'
  );
});

test('non-TemplateStyles attributes get no style label', t => {
  t.is(labelForStyleAttributes([]), undefined);
  t.is(labelForStyleAttributes(['class', 'my-style']), undefined);
  t.is(labelForStyleAttributes(['data-mw-deduplicate', 'other:r1']), undefined);
  t.is(
    labelForStyleAttributes(['data-mw-deduplicate', 'TemplateStyles:rabc']),
    undefined
  );
  t.is(
    labelForStyleAttributes(['data-mw-deduplicate', 'TemplateStyles:r123x']),
    undefined
  );
  t.is(labelForStyleAttributes(), undefined);
  t.is(labelForStyleAttributes('TemplateStyles:r1'), undefined);
});

// Location resolver: maps a 1-based line/column (as carried by Chrome
// trace events) to the owning module. The fixture bundle:
//   line 1: /* preamble */
//   line 2: mw.loader.impl(...["multi.line@ml001",function(){
//   line 3: function inner(){}
//   line 4: }];});
//   line 5: mw.loader.impl(...["module.two@def34",function(){}];});
//   line 6: mw.loader.state({"module.two":"ready"});
const multiLineModule =
  'mw.loader.impl(function(){return["multi.line@ml001",function(){\n' +
  'function inner(){}\n' +
  '}];});\n';
const trailer = 'mw.loader.state({"module.two":"ready"});';
const resolverBundle = preamble + multiLineModule + moduleTwo + trailer;

test('resolver maps line/column positions to the owning module', t => {
  const resolver = resourceLoaderLocationResolver(resolverBundle);

  // Preamble positions are not attributable to a module.
  t.is(resolver.resolve(1, 1), undefined);
  // Last byte of the preamble line (its newline).
  t.is(resolver.resolve(1, preamble.length), undefined);
  // First byte of the first module.
  t.deepEqual(resolver.resolve(2, 1), { name: 'multi.line', version: 'ml001' });
  // A line in the middle of a multi-line module.
  t.deepEqual(resolver.resolve(3, 10), {
    name: 'multi.line',
    version: 'ml001'
  });
  // Last byte of the first module (the newline ending line 4).
  t.deepEqual(resolver.resolve(4, 7), { name: 'multi.line', version: 'ml001' });
  // First byte of the next module.
  t.deepEqual(resolver.resolve(5, 1), { name: 'module.two', version: 'def34' });
  // Trailing bundle content belongs to the last module.
  t.deepEqual(resolver.resolve(6, 5), { name: 'module.two', version: 'def34' });
  // Very last byte of the source.
  t.deepEqual(resolver.resolve(6, trailer.length), {
    name: 'module.two',
    version: 'def34'
  });
});

test('resolver returns undefined for out-of-range positions', t => {
  const resolver = resourceLoaderLocationResolver(resolverBundle);

  // One past the last byte of the source.
  t.is(resolver.resolve(6, trailer.length + 1), undefined);
  // 0-based input would be a caller bug — column 0 on a module's first
  // line lands on the previous line's newline, line 0 has no line.
  t.is(resolver.resolve(2, 0), undefined);
  t.is(resolver.resolve(0, 1), undefined);
  t.is(resolver.resolve(7, 1), undefined);
  t.is(resolver.resolve(-1, 5), undefined);
});

test('source without delimiters has no resolver', t => {
  t.is(
    resourceLoaderLocationResolver('var a = 1;\nconsole.log(a);'),
    undefined
  );
});
