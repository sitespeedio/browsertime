import test from 'ava';
const { before, after, serial, afterEach } = test;
const timeout = 20_000;
import { startServer, stopServer } from './util/httpserver.js';
import { getEngine } from './util/engine.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
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
