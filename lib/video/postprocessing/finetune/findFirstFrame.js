'use strict';

const log = require('intel').getLogger('browsertime.video');

const LIMIT = 3;

function isWhiteFrame(frame) {
  return Number(frame.tags['lavfi.signalstats.SATLOW']) < LIMIT;
}

module.exports = function findFirstFrame(ffprobeOutput) {
  let firstFrame;
  // lets search for the first frame that have a lower value than ... say 3.
  // and make sure the frame after has the same value, to make us catch when
  // Chrome has frames with just a little orange in them
  const frames = ffprobeOutput.frames;
  for (let i = 0; i < frames.length - 1; i++) {
    // Two frames that are lower than the magic number should be ok. On Android
    // the SATAVG sometimes differ between frames, so lets check against the magic limit.
    if (isWhiteFrame(frames[i]) && isWhiteFrame(frames[i + 1])) {
      firstFrame = i;
      break;
    }
  }

  if (firstFrame === undefined) {
    log.error(JSON.stringify(ffprobeOutput));
  } else {
    log.verbose('Found the first frame %s', firstFrame);
  }

  return firstFrame;
};
