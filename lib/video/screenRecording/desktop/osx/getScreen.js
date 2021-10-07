'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');

module.exports = async function () {
  const scriptArgs = [
    '-hide_banner',
    '-f',
    'avfoundation',
    '-list_devices',
    true,
    '-i',
    0
  ];
  log.debug('Getting screen on OS X using %j', scriptArgs);

  /*
   ffmpeg  -hide_banner -f avfoundation -list_devices true -i 0
    Output like ...
    [AVFoundation input device @ 0x7fb919e00780] AVFoundation video devices:
    [AVFoundation input device @ 0x7fb919e00780] [0] FaceTime HD Camera
    [AVFoundation input device @ 0x7fb919e00780] [1] Capture screen 0
    [AVFoundation input device @ 0x7fb919e00780] AVFoundation audio devices:
    [AVFoundation input device @ 0x7fb919e00780] [0] Built-in Microphone
*/

  const output = await execa('ffmpeg', scriptArgs, { reject: false });
  log.debug('Output: %s', output.stderr);
  const reg = /\[(\d+)\] Capture screen/;
  return output.stderr.match(reg)[1];
};
