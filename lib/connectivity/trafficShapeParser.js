'use strict';

/* Config from throttle following WebPageTest */

const newProfiles = {
  '3g': {
    down: 1600,
    up: 768,
    rtt: 150
  },
  '3gfast': {
    down: 1600,
    up: 768,
    rtt: 75
  },
  '3gslow': {
    down: 400,
    up: 400,
    rtt: 200
  },
  '2g': {
    down: 280,
    up: 256,
    rtt: 400
  },
  cable: {
    down: 5000,
    up: 1000,
    rtt: 14
  },
  dsl: {
    down: 1500,
    up: 384,
    rtt: 25
  },
  '3gem': {
    down: 400,
    up: 400,
    rtt: 200
  },
  '4g': {
    down: 9000,
    up: 9000,
    rtt: 85
  },
  lte: {
    down: 12000,
    up: 12000,
    rtt: 35
  },
  edge: {
    down: 240,
    up: 200,
    rtt: 420
  },
  dial: {
    down: 49,
    up: 30,
    rtt: 60
  },
  fois: {
    down: 20000,
    up: 5000,
    rtt: 2
  }
};

const legacyProfiles = {
  '4g': {
    down: 9000,
    up: 9000,
    rtt: 85
  },
  '3g': {
    down: 1600,
    up: 768,
    rtt: 300
  },
  '3gfast': {
    down: 1600,
    up: 768,
    rtt: 150
  },
  '3gslow': {
    down: 780,
    up: 330,
    rtt: 200
  },
  '3gem': {
    down: 400,
    up: 400,
    latency: 400
  },
  '2g': {
    down: 35,
    up: 32,
    rtt: 1300
  },
  cable: {
    down: 5000,
    up: 1000,
    rtt: 28
  }
};

module.exports = {
  parseTrafficShapeConfig: function (options) {
    if (options.connectivity && options.connectivity.profile === 'custom') {
      return {
        down: options.connectivity.down,
        up: options.connectivity.up,
        rtt: options.connectivity.rtt,
        variance: options.connectivity.variance
      };
    }

    if (options.connectivity && options.connectivity.profile) {
      if (options.connectivity.profile === 'native') {
        return null;
      }

      const profile = options.legacyConnectivityProfiles
        ? legacyProfiles[options.connectivity.profile]
        : newProfiles[options.connectivity.profile];
      profile.variance = options.connectivity.variance;
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
  getProfiles: function () {
    return newProfiles;
  }
};
