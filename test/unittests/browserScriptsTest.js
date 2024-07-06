import test from 'ava';
import {
  findAndParseScripts,
  allScriptCategories,
  getScriptsForCategories
} from '../../lib/support/browserScript.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEST_SCRIPTS_FOLDER = path.resolve(
  __dirname,
  '..',
  'data',
  'browserscripts',
  'testscripts'
);

test(`Parse valid scripts`, async t => {
  const scriptsByCategory = await findAndParseScripts(
    TEST_SCRIPTS_FOLDER,
    'custom'
  );

  const categoryNames = Object.keys(scriptsByCategory);

  t.deepEqual(categoryNames, ['testscripts']);

  const testscriptsCategory = scriptsByCategory.testscripts;
  const scriptNames = Object.keys(testscriptsCategory);

  t.deepEqual(scriptNames, ['scriptTags']);

  t.notDeepEqual(testscriptsCategory.script, '');
});

test(`Get scripts for all categories`, async t => {
  const categories = await allScriptCategories();
  const scriptsByCategory = await getScriptsForCategories(categories);

  const categoryNames = Object.keys(scriptsByCategory);
  t.deepEqual(categoryNames, ['browser', 'pageinfo', 'timings']);
});
