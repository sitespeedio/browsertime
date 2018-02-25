'use strict';

const log = require('intel');

const LIMIT = 3;
module.exports = {
  get(ffprobeOutput) {
    let firstFrame;
    // lets search for the first frame that have a lower value than ... say 3.
    // and make sure the frame after has the same value, to make us caught when
    // Chrome has frames with just a little orange in them
    for (var i = 0; i < ffprobeOutput.frames.length; i++) {
      // Two frames that are lower than the magic number should be ok. On Android
      // the SATAVG sometimes differ between frames, so lets check against the magic limit.
      if (
        Number(ffprobeOutput.frames[i].tags['lavfi.signalstats.SATAVG']) <
          LIMIT &&
        Number(ffprobeOutput.frames[i + 1].tags['lavfi.signalstats.SATAVG']) <
          LIMIT
      ) {
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
