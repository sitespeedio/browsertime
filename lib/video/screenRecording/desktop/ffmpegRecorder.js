'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');

function buildX11FfmpegArgs({
  display,
  screen = 0,
  framerate = 30,
  origin = '0,0',
  size,
  filePath
}) {
  return [
    '-hide_banner',
    '-video_size',
    size,
    '-f',
    'x11grab',
    '-framerate',
    framerate,
    '-probesize',
    '1M',
    '-y',
    '-draw_mouse',
    '0',
    '-i',
    `:${display}.${screen}+${origin}`,
    '-codec:v',
    'libx264rgb',
    '-crf',
    0,
    '-preset',
    'ultrafast',
    filePath
  ];
}

async function startRecording(ffmpegArgs, nice, filePath) {
  async function waitForRecording(readableStream) {
    return new Promise((resolve, reject) => {
      readableStream.on('data', data => {
        log.trace(data.toString());
        if (data.toString().match(/Press \[q] to stop/)) {
          // readableStream.removeAllListeners('data');
          return resolve();
        }
      });
      readableStream.once('error', reject);
    });
  }
  let ffmpegProcess;
  if (nice !== 0) {
    ffmpegArgs.unshift('ffmpeg');
    ffmpegArgs.unshift(`${nice}`);
    ffmpegArgs.unshift('-n');
    ffmpegProcess = execa('nice', ffmpegArgs);
  } else {
    ffmpegProcess = execa('ffmpeg', ffmpegArgs);
  }

  // Race to catch if ffmpeg exists early, or if recording has started
  return Promise.race([ffmpegProcess, waitForRecording(ffmpegProcess.stderr)])
    .then(() => {
      log.debug('Started ffmpeg with ' + ffmpegArgs.join(' '));

      return {
        filePath,
        ffmpegProcess
      };
    })
    .catch(e => {
      throw e;
    });
}

module.exports = {
  /**
   * @returns A promise for a recording object. Pass it to stopRecording.
   */
  async startRecordingX11({
    display,
    origin,
    size,
    filePath,
    offset,
    framerate,
    crf,
    nice
  }) {
    const widthAndHeight = size.split('x');
    const withoutTopBar =
      parseInt(widthAndHeight[0]) -
      offset.x +
      'x' +
      (parseInt(widthAndHeight[1]) - offset.y);

    const ffmpegArgs = buildX11FfmpegArgs({
      display,
      origin,
      size: withoutTopBar,
      filePath,
      framerate,
      crf
    });
    return startRecording(ffmpegArgs, nice, filePath);
  },
  /**
   * @returns A promise for a recording result, with a filePath property.
   */
  async stopRecording(recording) {
    return Promise.resolve(recording).then(rec => {
      const process = rec.ffmpegProcess;
      delete rec.ffmpegProcess;
      process.stdin.write('q');
      return Promise.resolve(process).then(() => {
        log.debug('Stopped ffmpeg');
        return rec;
      });
    });
  }
};
