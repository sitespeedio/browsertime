'use strict';

const execa = require('execa'),
  log = require('intel');

module.exports = {
  run(videoPath, newStart, ttfFile, outputFile) {
    const scriptArgs = [
      '-ss', newStart,
      '-i', videoPath,
      '-c:v', 'libx264',
       '-vf', "drawtext=fontsize=15:fontfile=" + ttfFile + ": timecode='00\\:00\\:00\\:00':rate=60: x=(w-tw)/2: y=h-(2*lh):fontcolor=white:fontsize=32:box=1:boxcolor=0x000000AA",
      '-y',
      outputFile
    ];

    log.verbose('Running ffmpeg ' + scriptArgs.join(' '));

    return execa('ffmpeg', scriptArgs)
      .then((result) => result);
  }
};
