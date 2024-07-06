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

serial('Run stop watch commands', async t => {
  const result = await engine.runMultiple([getPath('stopWatch.cjs')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.true(result[0].extras[0].Measured_page > 0);
});
