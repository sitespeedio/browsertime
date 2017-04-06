'use strict';

const log = require('intel');

module.exports = {
    get(ffprobeOutput, minimumDiffLevel) {

        let firstValue =  Number(ffprobeOutput.frames[0].tags['lavfi.signalstats.SATAVG']);

        // sometimes the first frame is white so lets make up a value instead of taking the first frame. 65 aprox the orange we use.
        if (firstValue < 20) {
          firstValue = 65
        }

        let firstFrame;
        // lets search for the first frame where the difference betwee the first orange frame is larger than 60 = white.
        for (var i =5 ; i < ffprobeOutput.frames.length; i++) {
            if (firstValue - Number(ffprobeOutput.frames[i].tags['lavfi.signalstats.SATAVG']) > minimumDiffLevel) {
                firstFrame = i;
                break;
            }
        }

        if (firstFrame === undefined) {
          log.error(JSON.stringify(ffprobeOutput));
        }

        log.verbose('Found the first frame %s', firstFrame);
        return firstFrame;
    }
};
