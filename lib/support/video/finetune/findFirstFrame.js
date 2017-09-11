'use strict';

const log = require('intel');

module.exports = {
  get(ffprobeOutput) {
    let firstFrame;
    // lets search for the first frame that have a lower value than ... say 3.
    // and make sure the frame after has the same value, to make us caught when
    // Chrome has frames with just a little orange in them
    for (var i = 0; i < ffprobeOutput.frames.length; i++) {
      if (
        Number(ffprobeOutput.frames[i].tags['lavfi.signalstats.SATAVG']) < 3
      ) {
        if (
          Number(ffprobeOutput.frames[i].tags['lavfi.signalstats.SATAVG']) ===
          Number(ffprobeOutput.frames[i + 1].tags['lavfi.signalstats.SATAVG'])
        ) {
          firstFrame = i;
          break;
        }
      }
    }

    if (firstFrame === undefined) {
      log.error(JSON.stringify(ffprobeOutput));
    }

    log.verbose('Found the first frame %s', firstFrame);
    return firstFrame;
  }
};
