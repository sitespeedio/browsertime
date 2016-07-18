'use strict';

const trafficShapeParser = require('./trafficShapeParser'),
  sltc = require('sltc').sltc,
  execa = require('execa'),
  path = require('path'),
  log = require('intel');


const SCRIPT_PATH = path.join(__dirname, '..', '..', 'vendor', 'tsproxy.py');

let child = undefined;

module.exports = {
  set: function(options) {
    const profile = trafficShapeParser.parseTrafficShapeConfig(options);
    if (profile !== null) {
      if (options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tc') {
        sltc({
          device: options.connectivity.tc.device,
          bandwidth: {
            download: profile.downstreamKbps + 'kbps',
            upload: profile.upstreamKbps + 'kbps'
          },
          latency: profile.latency,
          pl: 0
        });

      } else if (options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tsproxy') {

        const scriptArgs = ['--rtt', profile.latency, '--inkbps', profile.downstreamKbps, '--outkbps', profile.upstreamKbps];
        log.info('Start tsproxy:' + SCRIPT_PATH + ' ' + scriptArgs.join(' '));
        child = execa(SCRIPT_PATH, scriptArgs);
      }
    }
  },
  remove: function(options) {
    if (options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tc') {
      sltc({
        device: options.connectivity.device,
        remove: true
      });
    } else if (options.connectivity && options.connectivity.engine && options.connectivity.engine === 'tsproxy') {
      child.kill('SIGINT');
    }
  }
}
