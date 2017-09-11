'use strict';

const execa = require('execa'),
  log = require('intel'),
  Promise = require('bluebird');

function buildX11FfmpegArgs({
  display,
  screen = 0,
  framerate = 60,
  origin = '0,0',
  size,
  filePath,
  crf = 23
}) {
  return [
    '-hide_banner',
    '-an',
    '-y',
    '-framerate',
    framerate,
    '-probesize',
    '1M',
    '-video_size',
    size,
    '-f',
    'x11grab',
    '-draw_mouse',
    '0',
    '-i',
    `:${display}.${screen}+${origin}`,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    crf,
    '-profile:v',
    'main',
    '-movflags',
    'faststart',
    '-preset',
    'ultrafast',
    filePath
  ];
}

function buildAVFoundationFfmpegArgs({
  display,
  framerate = 60,
  filePath,
  crf = 23
}) {
  return [
    '-hide_banner',
    '-an',
    '-y',
    '-framerate',
    framerate,
    '-f',
    'avfoundation',
    '-crf',
    crf,
    '-i',
    `${display}.0`,
    filePath
  ];
}

function startRecording(ffmpegArgs, filePath) {
  function waitForRecording(readableStream) {
    return new Promise((resolve, reject) => {
      readableStream.on('data', data => {
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
  startRecordingX11({
    display,
    origin,
    size,
    filePath,
    offset,
    framerate,
    crf
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
    return startRecording(ffmpegArgs, filePath);
  },
  /**
   * @returns A promise for a recording object. Pass it to stopRecording.
   */
  startRecordingAVFoundation({ display, filePath, framerate, crf }) {
    const ffmpegArgs = buildAVFoundationFfmpegArgs({
      display,
      filePath,
      framerate,
      crf
    });
    return startRecording(ffmpegArgs, filePath);
  },
  /**
   * @returns A promise for a recording result, with a filePath property.
   */
  stopRecording(recording) {
    return Promise.resolve(recording).then(rec => {
      const process = rec.ffmpegProcess;
      delete rec.ffmpegProcess;
      process.stdin.write('q');
      return Promise.resolve(process)
        .then(() => rec)
        .tap(() => log.debug('Stopped ffmpeg'));
    });
  }
};
