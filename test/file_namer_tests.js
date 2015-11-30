'use strict';

let fileNamer = require('../lib/support/file-namer').fileNamer,
  expect = require('chai').expect;

describe('file-namer', function() {
  describe('#getNameFromUrl', function() {
    it('should parse name from url', function() {
      let fileName = fileNamer().getNameFromUrl('http://www.browsertime.net/foo?123', 'json');

      expect(fileName).to.match(/www-browsertime-net/);
    });

    it('should use same timestamp for multiple files', function(done) {
      const namer = fileNamer();
      let firstFile = namer.getNameFromUrl('http://www.browsertime.net/foo?123', 'json');

      setTimeout(() => {
        let secondFile = namer.getNameFromUrl('http://www.browsertime.net/foo?123', 'json');
        expect(firstFile).to.equal(secondFile);
        done();
      }, 100);
    });
  });
});
