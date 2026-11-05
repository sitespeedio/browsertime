import test from 'ava';
const { before, after, serial } = test;
import { getEngine } from '../util/engine.js';
import { startServer, stopServer } from '../util/httpserver.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const timeout = 60_000;

function getPath(file) {
  return path.resolve(__dirname, '..', 'data', 'commandscripts', file);
}

before('Setup the HTTP server', () => {
  return startServer();
});

after.always('Stop the HTTP server', () => {
  return stopServer();
});

// Firefox stays open in debug mode, so only test Chrome.
serial('Continue after breakpoints in debug mode', async t => {
  t.timeout(timeout);
  if (process.env.BROWSER === 'firefox') {
    return t.pass();
  }
  const engine = getEngine({ debug: true });
  await engine.start();
  try {
    const result = await engine.runMultiple([getPath('debugBreakpoint.cjs')], {
      scripts: { uri: 'document.documentURI' }
    });
    t.is(
      result[0].browserScripts[0].scripts.uri,
      'http://127.0.0.1:3000/simple/'
    );
  } finally {
    await engine.stop();
  }
});
