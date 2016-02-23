'use strict';

const profiles = {
  'mobile3g': {
    downstreamKbps: 1600,
    upstreamKbps: 768,
    latency: 300
  },
  'mobile3gfast': {
    downstreamKbps: 1600,
    upstreamKbps: 768,
    latency: 150
  },
  'mobile3gslow': {
    downstreamKbps: 780,
    upstreamKbps: 330,
    latency: 200
  },
  'mobile2g': {
    downstreamKbps: 35,
    upstreamKbps: 32,
    latency: 1300
  },
  'cable': {
    downstreamKbps: 5000,
    upstreamKbps: 1000,
    latency: 28
  }
};

module.exports = {
  parseTrafficShapeConfig: function(options) {
    if (options.connectionRaw) {
      return options.connectionRaw;
    }

    if (options.connection) {
      if (options.connection === 'native') {
        return null;
      }

      let profile = profiles[options.connection];
      if (!profile) {
        throw new Error(`Unknown connection profile ${options.connection}`);
      }
      return profile;
    } else {
      return null;
    }
  },
  getProfiles: function() {
    return profiles;
  }
};
