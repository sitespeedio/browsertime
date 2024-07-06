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

serial('Measure two urls after each other', async t => {
  const result = await engine.runMultiple([getPath('measure.cjs')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.deepEqual(
    result[0].browserScripts[0].scripts.uri,
    'http://127.0.0.1:3000/simple/'
  );
  t.deepEqual(
    result[1].browserScripts[0].scripts.uri,
    'http://127.0.0.1:3000/dimple/'
  );
});

serial('Give each URL an alias', async t => {
  const result = await engine.runMultiple([getPath('measureAlias.cjs')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.deepEqual(result[0].info.alias, 'url1');
  t.deepEqual(result[1].info.alias, 'url2');
});
