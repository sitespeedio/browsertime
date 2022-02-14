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
  engine = getEngine({ browser: 'chrome' });
  return engine.start();
});

test.serial('should be able to to run Chrome specific commands', async t => {
  const result = await engine.runMultiple([getPath('chrome.js')], {
    scripts: {
      uri: 'document.documentURI'
    }
  });

  t.deepEqual(
    result[0].browserScripts[0].scripts.uri,
    'http://127.0.0.1:3000/simple/'
  );
});
