'use strict';

let assert = require('assert'),
  path = require('path'),
  parser = require('../lib/support/browser_script');

describe('#parseBrowserScripts', function() {
  it('should parse valid scripts', function(done) {
    let scripts = parser.parseBrowserScripts(path.resolve(__dirname, 'browserscripts'));
    scripts.then(function(s) {
      assert.equal(1, s.length);
      assert.equal(path.basename(s[0].path), 'script.js');
      assert.notEqual(s[0].source, '');
    }).then(done, done);
  });
});
