'use strict';

const trafficShapeParser = require('./trafficShapeParser');
const get = require('lodash.get');
const throttle = require('@sitespeed.io/throttle');
const log = require('intel').getLogger('browsertime.connectivity');
const TSProxy = require('./tsProxy');

let tsProxyInstance = null;

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
        if (setOnLocalHost) {
          return throttle.start({
            localhost: true,
            rtt: profile.latency
          });
        } else {
          return throttle.start({
            up: profile.upstreamKbps,
            down: profile.downstreamKbps,
            rtt: profile.latency
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
