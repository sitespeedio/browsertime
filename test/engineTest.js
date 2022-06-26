const test = require('ava');
const path = require('path');
const timeout = 20000;
const { startServer, stopServer } = require('./util/httpserver');
const { getEngine } = require('./util/engine');

let engine;

test.before('Setup the HTTP server', () => {
  return startServer();
});

test.after.always('Stop the HTTP server', () => {
  return stopServer();
});

test.serial.beforeEach('Start the browser', async t => {
  t.timeout(timeout);
  engine = getEngine();
  return engine.start();
});

test.afterEach.always('Stopping the engine', async () => {
  return engine.stop();
});

test.serial(`Load one URL with normal page load strategy`, async t => {
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

test.serial(`Load one URL with none page load strategy`, async t => {
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

test.serial(`Load multiple URLs`, async t => {
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

test.serial(`Use pre/post scripts`, async t => {
  function loadTaskFile(file) {
    return require(path.resolve(__dirname, 'data', 'prepostscripts', file));
  }

  engine = getEngine({
    preTask: loadTaskFile('preSample.js'),
    postTask: [loadTaskFile('postSample.js')]
  });
  await engine.start();
  await engine.run('http://127.0.0.1:3000/simple/', {});
  t.pass();
});

test.serial(`Run inline pageCompleteChecks`, async t => {
  engine = getEngine({
    pageCompleteCheck:
      'return (function() { try { var end = window.performance.timing.loadEventEnd; return (end > 0) && (Date.now() > end + 5000); } catch(e) { return true; }})();',
    timeouts: {
      browserStart: 60000,
      scripts: 5000,
      pageLoad: 10000,
      pageCompleteCheck: 15000
    }
  });
  await engine.start();
  await engine.run('http://127.0.0.1:3000/simple/', {});
  t.pass();
});

test.serial('Run pageCompleteCheck from file', async t => {
  engine = getEngine({
    pageCompleteCheck: 'test/data/pagecompletescripts/pageComplete10sec.js',
    timeouts: {
      browserStart: 60000,
      scripts: 5000,
      pageLoad: 10000,
      pageCompleteCheck: 15000
    }
  });
  await engine.start();
  await engine.run('http://127.0.0.1:3000/simple/', {});
  t.pass();
});
