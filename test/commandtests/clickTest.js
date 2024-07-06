import test from 'ava';
const { before, after, serial } = test;
import { getEngine } from '../util/engine.js';
import { startServer, stopServer } from '../util/httpserver.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const timeout = 20_000;

let engine;

function getPath(file) {
  return path.resolve(__dirname, '..', 'data', 'commandscripts', file);
}

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

serial('Measure the urls after a click', async t => {
  const result = await engine.runMultiple([getPath('clickAndMeasure.cjs')], {
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

serial('Measure URL after a click that got an alias', async t => {
  const result = await engine.runMultiple([getPath('clickAndMeasure.cjs')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.deepEqual(result[0].info.alias, 'dimple');

  t.is(
    result.har.log.entries[0].request.url,
    'http://127.0.0.1:3000/dimple/',
    'Could not verify we got a HAR from the browser'
  );
});

serial('Get the alias after multiple clicks', async t => {
  const result = await engine.runMultiple([getPath('clickBackAndForth.cjs')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.deepEqual(result[0].info.alias, 'simple');

  t.is(
    result.har.log.entries[0].request.url,
    'http://127.0.0.1:3000/search/',
    'Could not verify we got a HAR from the browser'
  );
});

serial('Measure urls after multiple clicks', async t => {
  const result = await engine.runMultiple([getPath('clickBackAndForth.cjs')], {
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
