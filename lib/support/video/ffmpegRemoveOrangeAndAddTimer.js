'use strict';

const execa = require('execa'),
  log = require('intel');

module.exports = {
  run(videoPath, newStart, outputFile) {
    const scriptArgs = [
      '-ss', newStart,
      '-i', videoPath,
      '-c:v', 'libx264',
      '-an',
      '-vf', "drawtext=timecode='00\\:00\\:00\\:00':rate=60: x=(w-280)/2: y=H-60:fontcolor=white:fontsize=48:box=1:boxcolor=0x000000AA",
      '-y',
      outputFile
    ];

    log.verbose('Running ffmpeg ' + scriptArgs.join(' '));

    return execa('ffmpeg', scriptArgs)
      .then((result) => result);
  }
};
