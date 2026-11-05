import test from 'ava';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getScriptLocation } from '../../lib/support/scriptLocation.js';

const browsertimeLib = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'lib'
);
const script = path.join(mkdtempSync(path.join(tmpdir(), 'bt-')), 'test.mjs');
writeFileSync(
  script,
  "export default async function (context, commands) {\n  await commands.foo.run('x');\n}\n"
);

function errorWithStack(...frames) {
  const error = new TypeError('Something failed');
  error.stack = ['TypeError: Something failed', ...frames].join('\n');
  return error;
}

test('Find the line in the user script after Browsertime and dependencies', t => {
  const error = errorWithStack(
    `    at Click.byId (${path.join(browsertimeLib, 'core', 'engine', 'command', 'click.js')}:10:5)`,
    `    at thenableWebDriverProxy.execute (${path.join(path.sep, 'app', 'node_modules', 'selenium-webdriver', 'lib', 'webdriver.js')}:20:3)`,
    '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)',
    `    at async default (${pathToFileURL(script).href}:2:3)`
  );
  t.is(
    getScriptLocation(error),
    `${script} line 2: await commands.foo.run('x');`
  );
});

test('Give the location without code when the file cannot be read', t => {
  const missing = path.join(path.dirname(script), 'missing.cjs');
  const error = errorWithStack(`    at module.exports (${missing}:7:1)`);
  t.is(getScriptLocation(error), `${missing} line 7`);
});

test('Give nothing when the stack has no user script', t => {
  const error = errorWithStack(
    `    at Measure.start (${path.join(browsertimeLib, 'core', 'engine', 'command', 'measure.js')}:1:1)`,
    '    at node:internal/main/run_main_module:33:47'
  );
  t.is(getScriptLocation(error), undefined);
  t.is(getScriptLocation(), undefined);
});
