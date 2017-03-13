'use strict';

let filters = require('../lib/support/filters'),
  assert = require('assert'),
  fs = require('fs'),
  path = require('path');

describe('filters', function() {
  describe('#userTimingWhitelist', function() {
    it('should filter out entries based on a whitelist', function() {
        let datadir = path.resolve(__dirname, 'testdata');
        let timings = path.resolve(datadir, 'timings.json');

        let userTimings = JSON.parse(fs.readFileSync(timings, 'utf-8'));
        let results = filters.userTimingWhitelist(userTimings, 'foo_');
        assert.equal(JSON.stringify(results.timings.userTimings.marks), '[{"name":"foo_test","startTime":"1500.111"},{"name":"foo_test2","startTime":"1100.111"}]');
        assert.equal(JSON.stringify(results.timings.userTimings.measures), '[{"name":"foo_test3","startTime":"1500.111"},{"name":"foo_test4","startTime":"1100.111"}]');
    });
  });
});