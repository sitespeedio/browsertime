'use strict';

const log = require('intel').getLogger('browsertime.video');

module.exports = function findFirstFrame(ffprobeOutput) {
  log.verbose('FFProbe output %j', ffprobeOutput);

  let firstFrame;
  const frames = ffprobeOutput.frames;
  // https://ffmpeg.org/ffprobe-all.html#signalstats-1
  const firstValue = Number(frames[0].tags['lavfi.signalstats.HUEAVG']);
  
  for (let i = 1; i < frames.length - 1; i++) {
    if (Number(frames[i].tags['lavfi.signalstats.HUEAVG']) !== firstValue) {
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
