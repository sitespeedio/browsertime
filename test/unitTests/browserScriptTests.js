'use strict';

let assert = require('assert'),
  path = require('path'),
  parser = require('../../lib/support/browserScript');

const TEST_SCRIPTS_FOLDER = path.resolve(
  __dirname,
  '..',
  'browserscripts',
  'testscripts'
);

describe('#parseBrowserScripts', function() {
  it('should parse valid scripts', function() {
    return parser
      .findAndParseScripts(TEST_SCRIPTS_FOLDER, 'custom')
      .then(scriptsByCategory => {
        const categoryNames = Object.keys(scriptsByCategory);

        assert.deepEqual(categoryNames, ['testscripts']);

        const testscriptsCategory = scriptsByCategory.testscripts;
        const scriptNames = Object.keys(testscriptsCategory);

        assert.deepEqual(scriptNames, ['scriptTags']);

        assert.notEqual(testscriptsCategory.script, '');
      });
  });

  it('should get scripts for all categories', function() {
    return parser.allScriptCategories
      .then(categories => parser.getScriptsForCategories(categories))
      .then(scriptsByCategory => {
        const categoryNames = Object.keys(scriptsByCategory);

        assert.deepEqual(categoryNames, ['browser', 'pageinfo', 'timings']);
      });
  });
});
