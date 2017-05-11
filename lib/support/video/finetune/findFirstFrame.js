'use strict';

const log = require('intel');

module.exports = {
    get(ffprobeOutput) {

        let firstFrame;
        // lets search for the first frame that have a lower value than ... say 3.
        for (var i =5 ; i < ffprobeOutput.frames.length; i++) {
            if (Number(ffprobeOutput.frames[i].tags['lavfi.signalstats.SATAVG']) < 3) {
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
