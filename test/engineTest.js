import test from 'ava';
const { before, after, serial, afterEach } = test;
const timeout = 20_000;
import { startServer, stopServer } from './util/httpserver.js';
import { getEngine } from './util/engine.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let engine;

before('Setup the HTTP server', () => {
  return startServer();
});

after.always('Stop the HTTP server', () => {
  return stopServer();
});

serial.beforeEach('Start the browser', async t => {
  t.timeout(timeout);
  engine = getEngine();
  return engine.start();
});

afterEach.always('Stopping the engine', async () => {
  return engine.stop();
});

serial(`Load one URL with normal page load strategy`, async t => {
  const scripts = {
    foo: '(function () {return "fff";})()',
    uri: 'document.documentURI',
    fourtytwo: '(function () {return 42;})()'
  };

  let result = await engine.run(
    'http://127.0.0.1:3000/simple/',
    {
      scripts
    },
    {
      scripts: { promiseFourtyThree: 'Promise.resolve(43)' }
    }
  );

  t.deepEqual(
    result[0].browserScripts[0].scripts,
    {
      foo: 'fff',
      uri: 'http://127.0.0.1:3000/simple/',
      fourtytwo: 42,
      promiseFourtyThree: 43
    },
    'Could not verify that scripts run correctly in the browser'
  );

  // We also want to make sure we got a HAR file
  t.is(
    result.har.log.entries[0].request.url,
    'http://127.0.0.1:3000/simple/',
    'Could not verify we got a HAR from the browser'
  );
});

serial(`Load one URL with none page load strategy`, async t => {
  const scripts = {
    foo: '(function () {return "fff";})()',
    uri: 'document.documentURI',
    fourtytwo: '(function () {return 42;})()'
  };

  engine = getEngine({ pageLoadStrategy: 'none' });
  await engine.start();

  let result = await engine.run(
    'http://127.0.0.1:3000/simple/',
    {
      scripts
    },
    {
      scripts: { promiseFourtyThree: 'Promise.resolve(43)' }
    }
  );

  t.deepEqual(
    result[0].browserScripts[0].scripts,
    {
      foo: 'fff',
      uri: 'http://127.0.0.1:3000/simple/',
      fourtytwo: 42,
      promiseFourtyThree: 43
    },
    'Could not verify that scripts run correctly in the browser'
  );

  // We also want to make sure we got a HAR file
  t.is(
    result.har.log.entries[0].request.url,
    'http://127.0.0.1:3000/simple/',
    'Could not verify we got a HAR from the browser'
  );
});

serial(`Load multiple URLs`, async t => {
  const scripts = {
    foo: '(function () {return "fff";})()',
    uri: 'document.documentURI',
    fourtytwo: '(function () {return 42;})()'
  };
  const asyncScript = { promiseFourtyThree: 'Promise.resolve(43)' };

  let result = await engine.runMultiple(
    ['http://127.0.0.1:3000/simple/', 'http://127.0.0.1:3000/dimple/'],
    {
      scripts
    },
    {
      scripts: asyncScript
    }
  );

  t.deepEqual(
    result[0].browserScripts[0].scripts,
    {
      foo: 'fff',
      uri: 'http://127.0.0.1:3000/simple/',
      fourtytwo: 42,
      promiseFourtyThree: 43
    },
    'Could not verify that scripts run correctly in the browser'
  );

  t.deepEqual(result[1].browserScripts[0].scripts, {
    foo: 'fff',
    uri: 'http://127.0.0.1:3000/dimple/',
    fourtytwo: 42,
    promiseFourtyThree: 43
  });
});

function loadTaskFile(file) {
  return require(path.resolve(__dirname, 'data', 'prepostscripts', file));
}

serial(`Use pre/post scripts`, async t => {
  engine = getEngine({
    preTask: loadTaskFile('preSample.cjs'),
    postTask: [loadTaskFile('postSample.cjs')]
  });
  await engine.start();
  await engine.run('http://127.0.0.1:3000/simple/', {});
  t.pass();
});

serial(`Give pre/post scripts the tested URL`, async t => {
  const urls = [];
  const remember = async context => urls.push(context.url);
  engine = getEngine({ preScript: [remember], postScript: [remember] });
  await engine.start();
  await engine.run('http://127.0.0.1:3000/simple/', {});
  t.deepEqual(urls, [
    'http://127.0.0.1:3000/simple/',
    'http://127.0.0.1:3000/simple/'
  ]);
});

serial(`Run inline pageCompleteChecks`, async t => {
  engine = getEngine({
    pageCompleteCheck:
      'return (function() { try { var end = window.performance.timing.loadEventEnd; return (end > 0) && (Date.now() > end + 5000); } catch(e) { return true; }})();',
    timeouts: {
      browserStart: 60_000,
      scripts: 5000,
      pageLoad: 10_000,
      pageCompleteCheck: 15_000
    }
  });
  await engine.start();
  await engine.run('http://127.0.0.1:3000/simple/', {});
  t.pass();
});

serial('Run pageCompleteCheck from file', async t => {
  engine = getEngine({
    pageCompleteCheck: 'test/data/pagecompletescripts/pageComplete10sec.js',
    timeouts: {
      browserStart: 60_000,
      scripts: 5000,
      pageLoad: 10_000,
      pageCompleteCheck: 15_000
    }
  });
  await engine.start();
  await engine.run('http://127.0.0.1:3000/simple/', {});
  t.pass();
});

serial('Stop after the current iteration', async t => {
  engine = getEngine({ iterations: 3 });
  await engine.start();
  engine.stopAfterCurrentIteration();
  const result = await engine.run('http://127.0.0.1:3000/simple/', {});
  t.is(result[0].browserScripts.length, 1);
});

serial('Find a visual element inside an open shadow root', async t => {
  engine = getEngine({
    scriptInput: { visualElements: 'ShadowHeading:#shadow-heading' }
  });
  await engine.start();
  const visualElements = readFileSync(
    path.resolve(
      __dirname,
      '..',
      'browserscripts',
      'pageinfo',
      'visualElements.js'
    ),
    'utf8'
  );
  const result = await engine.run('http://127.0.0.1:3000/shadow/', {
    pageinfo: { visualElements }
  });
  const heroes = result[0].browserScripts[0].pageinfo.visualElements.heroes;
  t.true(heroes.some(hero => hero.name === 'ShadowHeading'));
});

function readBrowserScript(file) {
  return readFileSync(
    path.resolve(__dirname, '..', 'browserscripts', file),
    'utf8'
  );
}

serial('Find visual elements and element timings inside iframes', async t => {
  engine = getEngine({
    scriptInput: {
      visualElements: ['DeepHeading:#deep-heading', 'Clipped:#clipped']
    }
  });
  await engine.start();
  const result = await engine.run('http://127.0.0.1:3000/iframe/', {
    pageinfo: {
      visualElements: readBrowserScript('pageinfo/visualElements.js')
    },
    timings: { elementTimings: readBrowserScript('timings/elementTimings.js') }
  });
  const scripts = result[0].browserScripts[0];
  const heroes = scripts.pageinfo.visualElements.heroes;
  const position = name => {
    const hero = heroes.find(hero => hero.name === name);
    return hero && [hero.x, hero.y, hero.width, hero.height];
  };
  // The margins and borders of the two iframes move the elements
  t.deepEqual(position('DeepHeading').slice(0, 2), [138, 78]);
  t.deepEqual(position('deep-heading').slice(0, 2), [138, 78]);
  // The inner iframe only shows 50 of the 200 pixels
  t.deepEqual(position('Clipped'), [488, 178, 50, 20]);
  // Firefox does not support the Element Timing API
  if (process.env.BROWSER !== 'firefox') {
    t.true(scripts.timings.elementTimings['deep-heading'].renderTime > 0);
  }
});

serial(
  'Tell why the LCP element is missing from the visual elements',
  async t => {
    // Safari does not support the Largest Contentful Paint API
    if (process.env.BROWSER === 'safari') {
      t.pass();
      return;
    }
    // Give the test page time to move the LCP element after the load event
    engine = getEngine({ pageCompleteWaitTime: 1000 });
    await engine.start();
    const visualElements = readBrowserScript('pageinfo/visualElements.js');
    const visualElementsFor = async url => {
      const result = await engine.run(url, { pageinfo: { visualElements } });
      return result[0].browserScripts[0].pageinfo.visualElements;
    };

    const moved = await visualElementsFor('http://127.0.0.1:3000/lcpmoved/');
    t.false(moved.heroes.some(hero => hero.name === 'LargestContentfulPaint'));
    t.deepEqual(moved.skipped, [
      { name: 'LargestContentfulPaint', reason: 'outsideViewport' }
    ]);

    const simple = await visualElementsFor('http://127.0.0.1:3000/simple/');
    t.true(simple.heroes.some(hero => hero.name === 'LargestContentfulPaint'));
    t.deepEqual(simple.skipped, []);
  }
);
