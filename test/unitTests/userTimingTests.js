'use strict';

const userTiming = require('../../lib/support/userTiming');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('userTiming', function() {
  describe('#filterWhitelisted', function() {
    it('should filter out entries based on a whitelist', function() {
      const timingsFile = path.resolve(
        __dirname,
        '..',
        'testdata',
        'timings.json'
      );

      const userTimings = JSON.parse(fs.readFileSync(timingsFile, 'utf-8'))
        .timings.userTimings;

      userTiming.filterWhitelisted(userTimings, 'foo_');
      assert.equal(
        JSON.stringify(userTimings.marks),
        '[{"name":"foo_test","startTime":"1500.111"},{"name":"foo_test2","startTime":"1100.111"}]'
      );
      assert.equal(
        JSON.stringify(userTimings.measures),
        '[{"name":"foo_test3","startTime":"1500.111"},{"name":"foo_test4","startTime":"1100.111"}]'
      );
    });
  });
});
