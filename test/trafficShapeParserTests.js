'use strict';

let parser = require('../lib/support/trafficShapeParser'),
  expect = require('chai').expect;

describe('traffic_shape_parser', function() {
  describe('#parseTrafficShapeConfig', function() {


    it('should convert the raw config', function() {
      let rawConfig = "{\"downstreamKbps\": 42, \"upstreamKbps\": 18, \"latency\": 37}";

      let shapeConfig = parser.parseTrafficShapeConfig({
        connectivity: {
          config: rawConfig
        }
      });
      shapeConfig.downstreamKbps.should.equal(42);
      shapeConfig.upstreamKbps.should.equal(18);
      shapeConfig.latency.should.equal(37);
    });

    let profiles = parser.getProfiles();

    Object.keys(profiles).forEach(function(name) {
      let profile = profiles[name];

      it('should return profile for ' + name, function() {
        let shapeConfig = parser.parseTrafficShapeConfig({
          connectivity: {profile: name}
        });
        shapeConfig.should.deep.equal(profile);
      });
    });

    it('should return null for "native" traffic shape config', function() {
      let shapeConfig = parser.parseTrafficShapeConfig({
        connectivity: {profile: 'native'}
      });
      expect(shapeConfig).to.equal(null);
    });

    it('should return undefined if traffic shape config is missing', function() {
      let shapeConfig = parser.parseTrafficShapeConfig({});
      expect(shapeConfig).to.equal(null);
    });

  });
});
