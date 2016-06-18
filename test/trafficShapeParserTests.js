'use strict';

let parser = require('../lib/support/trafficShapeParser'),
  expect = require('chai').expect;

describe('traffic_shape_parser', function() {
  describe('#parseTrafficShapeConfig', function() {
    // DIsable raw config for a while
    /*
    it('should not modify a specified raw connection config', function() {
      let rawConfig = {
        downstreamKbps: 42,
        upstreamKbps: 18,
        latency: 37
      };

      let shapeConfig = parser.parseTrafficShapeConfig({
        connectionRaw: rawConfig
      });
      shapeConfig.should.deep.equal(rawConfig);
    });
    */
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
        connection: {profile: 'native'}
      });
      expect(shapeConfig).to.equal(null);
    });

    it('should return undefined if traffic shape config is missing', function() {
      let shapeConfig = parser.parseTrafficShapeConfig({});
      expect(shapeConfig).to.equal(null);
    });

  });
});
