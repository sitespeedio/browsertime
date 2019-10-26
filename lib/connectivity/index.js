'use strict';

const trafficShapeParser = require('./trafficShapeParser');
const get = require('lodash.get');
const throttle = require('@sitespeed.io/throttle');
const log = require('intel').getLogger('browsertime.connectivity');
const TSProxy = require('./tsProxy');

let tsProxyInstance = null;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  async addConnectivity(options) {
    const profile = trafficShapeParser.parseTrafficShapeConfig(options);
    if (!profile) {
      return;
    }

    const connectivity = options.connectivity;
    switch (connectivity.engine) {
      case 'external': {
        return;
      }
      case 'throttle': {
        if (!options.docker) {
          // The log message is confusing if you run in Docker since
          // there's nothing you can do about it
          log.info('Changing network interfaces needs sudo rights.');
        }

        const setOnLocalHost = get(connectivity, 'throttle.localhost', false);
        const latency = profile.variance
          ? getRandomIntInclusive(
              profile.latency,
              Math.ceil(profile.latency * (profile.variance / 100 + 1))
            )
          : profile.latency;
        if (profile.variance) {
          log.info(
            'Using random variance %s% setting the latency to %s (configured %s)',
            profile.variance,
            latency,
            profile.latency
          );
        }
        if (setOnLocalHost) {
          return throttle.start({
            localhost: true,
            rtt: latency
          });
        } else {
          return throttle.start({
            up: profile.upstreamKbps,
            down: profile.downstreamKbps,
            rtt: latency
          });
        }
      }
      case 'tsproxy': {
        tsProxyInstance = new TSProxy(options);
        return tsProxyInstance.start(profile);
      }
    }
  },
  async removeConnectivity(options) {
    const profile = trafficShapeParser.parseTrafficShapeConfig(options);
    if (!profile) {
      return;
    }

    const connectivity = options.connectivity;
    switch (connectivity.engine) {
      case 'external': {
        return;
      }
      case 'throttle': {
        const setOnLocalHost = get(connectivity, 'throttle.localhost', false);
        return throttle.stop({ localhost: setOnLocalHost });
      }
      case 'tsproxy': {
        return tsProxyInstance.stop();
      }
    }
  }
};
