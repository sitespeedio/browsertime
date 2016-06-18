'use strict';

const trafficShapeParser = require('./trafficShapeParser'),
    sltc = require('sltc').sltc;

module.exports = {
    set: function(options) {
        const profile = trafficShapeParser.parseTrafficShapeConfig(options);
        if (profile !== null) {
            sltc({
                device: options.connectivity.device,
                bandwith: {
                    download: profile.downstreamKbps + 'kbps',
                    upload: profile.upstreamKbps + 'kbps'
                },
                latency: profile.latency,
                pl: 0
            });
        }
    },
    remove: function(options) {
      sltc({
            device: options.connectivity.device,
            remove: true
        });
    }
}
