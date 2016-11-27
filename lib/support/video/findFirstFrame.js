'use strict';

const log = require('intel');

module.exports = {
    get(ffprobeOutput) {
        // remove the decimals and only compare Integere values
        let firstValue = Number(ffprobeOutput.frames[0].tags['lavfi.signalstats.SATAVG']).toFixed(0);
        let firstFrame;

        for (var i = 1; i < ffprobeOutput.frames.length; i++) {
            // if this doesn't work out in the future, then lets test the diff
            if (Number(ffprobeOutput.frames[i].tags['lavfi.signalstats.SATAVG']).toFixed(0) !== firstValue) {
                firstFrame = i;
                break;
            }
        }
        log.verbose('Found the first frame %s', firstFrame);
        return firstFrame;
    }
}
