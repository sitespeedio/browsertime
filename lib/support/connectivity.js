'use strict';

const trafficShapeParser = require('./trafficShapeParser'),
    sltc = require('sltc').sltc,
    cp = require('child_process'),
      path = require('path'),
      Promise = require('bluebird'),
      log = require('intel');

    Promise.promisifyAll(cp);

    const SCRIPT_PATH = path.join(__dirname, '..', '..', 'vendor', 'tsproxy.py');

    let child = undefined;

module.exports = {
    set: function(options) {
        const profile = trafficShapeParser.parseTrafficShapeConfig(options);
        if (profile !== null) {
          if (options.connectivity.engine === 'tc') {
            sltc({
                device: options.connectivity.tc.device,
                bandwith: {
                    download: profile.downstreamKbps + 'kbps',
                    upload: profile.upstreamKbps + 'kbps'
                },
                latency: profile.latency,
                pl: 0
            });
        }
        else if (options.connectivity.engine === 'tsproxy') {

            const scriptArgs = ['--rtt', profile.latency, '--inkbps', profile.downstreamKbps, '--outkbps', profile.upstreamKbps];
            log.debug('Start the tsproxy');
            child = cp.execFile(SCRIPT_PATH, scriptArgs);
        }
      }
    },
    remove: function(options) {
      if (options.connectivity.engine === 'tc') {
        sltc({
            device: options.connectivity.device,
            remove: true
        });
      }
      else if (options.connectivity.engine === 'tsproxy') {
        child.kill('SIGINT');
      }
    }
}
