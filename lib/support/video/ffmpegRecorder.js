'use strict';

const execa = require('execa'),
  log = require('intel'),
  Promise = require('bluebird');

function buildX11FfmpegArgs({display, screen = 0, framerate = 30, origin = '0,0', size, filePath}) {
  return ['-hide_banner',
    '-an',
    '-y',
    '-framerate', framerate,
    '-video_size', size,
    '-f', 'x11grab',
    '-i', `:${display}.${screen}+${origin}`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'main',
    '-crf', '18',
    '-movflags',  'faststart',
    '-preset', 'ultrafast',
    filePath];
}

function buildAVFoundationFfmpegArgs({display, framerate = 30, filePath}) {
  return ['-hide_banner',
    '-an',
    '-y',
    '-framerate', framerate,
    '-f', 'avfoundation',
    '-i', `${display}.0`,
    filePath];
}

function startRecording(ffmpegArgs, filePath) {
  function waitForRecording(readableStream) {
    return new Promise((resolve, reject) => {
      readableStream.on('data', (data) => {
        log.debug(data.toString());
        if (data.toString().match(/Press \[q\] to stop/)) {
          // readableStream.removeAllListeners('data');
          return resolve();
        }
      });
      readableStream.once('error', reject);
    });
  }

  const ffmpegProcess = execa('ffmpeg', ffmpegArgs);

  // Race to catch if ffmpeg exists early, or if recording has started
  return Promise.race([ffmpegProcess, waitForRecording(ffmpegProcess.stderr)])
    .then(() => {
      log.debug('Started ffmpeg with ' + ffmpegArgs.join(' '));

      return {
        filePath,
        ffmpegProcess
      }
    })
    .catch((e) => {
      throw e;
    });
}

module.exports = {
  /**
   * @returns A promise for a recording object. Pass it to stopRecording.
   */
  startRecordingX11({display, origin = '0,64', size, filePath}) {
    const widthAndHeight = size.split('x');
    const withoutTopBar = widthAndHeight[0] + 'x' + (parseInt(widthAndHeight[1]) - 64);

    const ffmpegArgs = buildX11FfmpegArgs({display, origin, size: withoutTopBar, filePath});
    return startRecording(ffmpegArgs, filePath);
  },
  /**
   * @returns A promise for a recording object. Pass it to stopRecording.
   */
  startRecordingAVFoundation({display, filePath}) {
    const ffmpegArgs = buildAVFoundationFfmpegArgs({display, filePath});
    return startRecording(ffmpegArgs, filePath);
  },
  /**
   * @returns A promise for a recording result, with a filePath property.
   */
  stopRecording(recording) {
    return Promise.resolve(recording)
      .then((rec) => {
        const process = rec.ffmpegProcess;
        delete rec.ffmpegProcess;
        process.stdin.write('q');
        return Promise.resolve(process)
          .then(() => rec)
          .tap(() => log.debug('Stopped ffmpeg'));
      });
  }
};
