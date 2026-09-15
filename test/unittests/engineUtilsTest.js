import test from 'ava';
import { mkdtemp, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadPrePostScripts } from '../../lib/support/engineUtils.js';

async function scriptInOwnDirectory(contents) {
  const directory = await mkdtemp(path.join(tmpdir(), 'browsertime-script-'));
  const script = path.join(directory, 'script.js');
  await writeFile(script, contents);
  return { directory, script };
}

test('Load a .js user script', async t => {
  const { directory, script } = await scriptInOwnDirectory(
    'module.exports = async function () { return 42; };\n'
  );
  try {
    const [loaded] = await loadPrePostScripts([script], {});
    t.is(typeof loaded, 'function');
    t.is(await loaded(), 42);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('Remove the temporary package.json when a script fails to load', async t => {
  const { directory, script } = await scriptInOwnDirectory(
    'module.exports = ((( ;\n'
  );
  try {
    await t.throwsAsync(loadPrePostScripts([script], {}));
    t.deepEqual(
      await readdir(directory),
      ['script.js'],
      'the package.json written to load the script as commonjs must not be left behind'
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
