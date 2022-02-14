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

test.serial('should be able to to run scroll by pixel command', async t => {
  await engine.runMultiple([getPath('scrollByPixel.js')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.pass();
});

test.serial('should be able to to run scroll to bottom command', async t => {
  await engine.runMultiple([getPath('scrollToBottom.js')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.pass();
});
