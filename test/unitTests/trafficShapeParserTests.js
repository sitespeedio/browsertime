'use strict';

let parser = require('../../lib/support/trafficShapeParser'),
  expect = require('chai').expect;

describe('traffic_shape_parser', function() {
  describe('#parseTrafficShapeConfig', function() {
    let profiles = parser.getProfiles();

    Object.keys(profiles).forEach(function(name) {
      let profile = profiles[name];

      it('should return profile for ' + name, function() {
        let shapeConfig = parser.parseTrafficShapeConfig({
          connectivity: { profile: name }
        });
        shapeConfig.should.deep.equal(profile);
      });
    });

    it('should return null for "native" traffic shape config', function() {
      let shapeConfig = parser.parseTrafficShapeConfig({
        connectivity: { profile: 'native' }
      });
      expect(shapeConfig).to.equal(null);
    });

    it('should return undefined if traffic shape config is missing', function() {
      let shapeConfig = parser.parseTrafficShapeConfig({});
      expect(shapeConfig).to.equal(null);
    });
  });
});
