'use strict';

let builder = require('../lib/support/har_builder'),
  expect = require('chai').expect;

describe('har_builder', function() {
  let har;

  beforeEach(function() {
    har = {
      'log': {
        'version': '1.2',
        'browser': {
          'name': 'Chrome',
          'version': '42.0.2311.90',
          'comment': ''
        }
      }
    };
  });

  describe('#addCreator', function() {
    it('should add creator if missing', function() {
      builder.addCreator(har, 'foo');

      expect(har).to.have.deep.property('log.creator.name', 'Browsertime');
      expect(har).to.have.deep.property('log.creator.comment', 'foo');
    });
  });
});
