'use strict';

const profiles = {
  '3g': {
    downstreamKbps: 1600,
    upstreamKbps: 768,
    latency: 300
  },
  '3gfast': {
    downstreamKbps: 1600,
    upstreamKbps: 768,
    latency: 150
  },
  '3gslow': {
    downstreamKbps: 780,
    upstreamKbps: 330,
    latency: 200
  },
  '3gem': {
    downstreamKbps: 400,
    upstreamKbps: 400,
    latency: 400
  },
  '2g': {
    downstreamKbps: 35,
    upstreamKbps: 32,
    latency: 1300
  },
  cable: {
    downstreamKbps: 5000,
    upstreamKbps: 1000,
    latency: 28
  }
};

module.exports = {
  parseTrafficShapeConfig: function(options) {
    if (options.connectivity && options.connectivity.profile === 'custom') {
      return {
        downstreamKbps: options.connectivity.downstreamKbps,
        upstreamKbps: options.connectivity.upstreamKbps,
        latency: options.connectivity.latency
      };
    }

    if (options.connectivity && options.connectivity.profile) {
      if (options.connectivity.profile === 'native') {
        return null;
      }

      let profile = profiles[options.connectivity.profile];
      if (!profile) {
        throw new Error(
          `Unknown connectivity profile ${options.connectivity.profile}`
        );
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
