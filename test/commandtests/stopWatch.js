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

test.serial('should be able to to run stop watch commands', async t => {
  const result = await engine.runMultiple([getPath('stopWatch.js')], {
    scripts: { uri: 'document.documentURI' }
  });
  t.true(result[0].extras[0].Measured_page > 0);
});
