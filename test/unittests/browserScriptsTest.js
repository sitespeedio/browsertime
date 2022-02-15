const test = require('ava');
const path = require('path');
const parser = require('../../lib/support/browserScript');

const TEST_SCRIPTS_FOLDER = path.resolve(
  __dirname,
  '..',
  'data',
  'browserscripts',
  'testscripts'
);

test(`Parse valid scripts`, async t => {
  const scriptsByCategory = await parser.findAndParseScripts(
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
  const categories = await parser.allScriptCategories;
  const scriptsByCategory = await parser.getScriptsForCategories(categories);

  const categoryNames = Object.keys(scriptsByCategory);
  t.deepEqual(categoryNames, ['browser', 'pageinfo', 'timings']);
});
