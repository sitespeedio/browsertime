const test = require('ava');
const path = require('path');
const { getEngine } = require('../util/engine');
const { startServer, stopServer } = require('../util/httpserver');

const timeout = 20000;

let engine;

function getPath(file) {
  return path.resolve(__dirname, '..', 'data', 'commandscripts', file);
}

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

test.serial('Measure the urls after a click', async t => {
  const result = await engine.runMultiple([getPath('clickAndMeasure.js')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.deepEqual(
    result[0].browserScripts[0].scripts.uri,
    'http://127.0.0.1:3000/dimple/'
  );

  t.is(
    result.har.log.entries[0].request.url,
    'http://127.0.0.1:3000/dimple/',
    'Could not verify we got a HAR from the browser'
  );
});

test.serial('Measure URL after a click that got an alias', async t => {
  const result = await engine.runMultiple([getPath('clickAndMeasure.js')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.deepEqual(result[0].info.alias, 'dimple');

  t.is(
    result.har.log.entries[0].request.url,
    'http://127.0.0.1:3000/dimple/',
    'Could not verify we got a HAR from the browser'
  );
});

test.serial('Get the alias after multiple clicks', async t => {
  const result = await engine.runMultiple([getPath('clickBackAndForth.js')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.deepEqual(result[0].info.alias, 'simple');

  t.is(
    result.har.log.entries[0].request.url,
    'http://127.0.0.1:3000/search/',
    'Could not verify we got a HAR from the browser'
  );
});

test.serial('Measure urls after multiple clicks', async t => {
  const result = await engine.runMultiple([getPath('clickBackAndForth.js')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.deepEqual(
    result[0].browserScripts[0].scripts.uri,
    'http://127.0.0.1:3000/search/'
  );

  t.is(
    result.har.log.entries[0].request.url,
    'http://127.0.0.1:3000/search/',
    'Could not verify we got a HAR from the browser'
  );
});
