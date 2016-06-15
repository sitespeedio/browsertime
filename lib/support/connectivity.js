'use strict';

const trafficShapeParser = require('./trafficShapeParser'),
    sltc = require('sltc');

module.exports = {
    set: function(options) {
        const profile = trafficShapeParser(options);
        sltc({
            device: 'eth0',
            bandwith: {
                download: profile.downstreamKbps + 'kbps',
                upload: profile.upstreamKbps + 'kbps'
            },
            latency: profile.latency,
            pl: 0
        });
    },
    remove: function() {
        sltc({
            remove: true
        });
    }
}
