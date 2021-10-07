'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const getScreenOnOSX = require('./osx/getScreen');
const getSPDisplaysDataType = require('./osx/getSPDisplaysDataType');

async function buildX11FfmpegArgs({
  display,
  screen = 0,
  framerate = 30,
  origin = '0,0',
  size,
  filePath,
  offset,
  threads
}) {
  if (process.platform === 'darwin') {
    const osXScreen = await getScreenOnOSX();
    const SPDisplaysDataType = await getSPDisplaysDataType();
    const resregex = /(?<=Resolution:\s*)(\d+\s*x\s*\d+)/gm;
    const resolution = SPDisplaysDataType.match(resregex);
    const uiregex = /(?<=UI Looks like:\s*)(\d+\s*x\s*\d+)/gm;
    const uiLooksLike = SPDisplaysDataType.match(uiregex);
    const widthAndHeight = size.split('x');
    let devicePixelRatio = SPDisplaysDataType.indexOf('Retina') > -1 ? 2 : 1;
    // Lets add better check in the future. Right now: If we have uilookslike and
    // is not the same as the resolution, say it DPI 2
    if (uiLooksLike && resolution[0].trim() !== uiLooksLike[0].trim()) {
      devicePixelRatio = 2;
    }
    log.verbose(SPDisplaysDataType);
    return [
      '-f',
      'avfoundation',
      '-i',
      osXScreen,
      '-r',
      30,
      '-filter:v',
      `crop=${widthAndHeight[0] * devicePixelRatio}:${
        widthAndHeight[1] * devicePixelRatio
      }:${offset.x * devicePixelRatio}:${offset.y * devicePixelRatio}`,
      '-codec:v',
      'libx264rgb',
      '-threads',
      threads,
      '-crf',
      '0',
      '-preset',
      'ultrafast',
      filePath
    ];
  } else {
    const videoGrabber = process.platform === 'win32' ? 'gdigrab' : 'x11grab';
    return [
      '-hide_banner',
      '-video_size',
      size,
      '-f',
      videoGrabber,
      '-framerate',
      framerate,
      '-probesize',
      '10M',
      '-y',
      '-draw_mouse',
      '0',
      '-i',
      process.platform === 'win32'
        ? 'desktop'
        : `:${display}.${screen}+${origin}`,
      '-codec:v',
      'libx264rgb',
      '-threads',
      threads,
      '-crf',
      0,
      '-preset',
      'ultrafast',
      '-vf',
      'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      filePath
    ];
  }
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
    log.debug('Start FFMPEG with %j', ffmpegArgs);
    ffmpegProcess = execa('nice', ffmpegArgs);
  } else {
    log.debug('Start FFMPEG with %j', ffmpegArgs);
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
      log.error(e);
      throw e;
    });
}

module.exports = {
  /**
   * @returns A promise for a recording object. Pass it to stopRecording.
   */
  async start({
    display,
    origin,
    size,
    filePath,
    offset,
    framerate,
    crf,
    nice,
    threads
  }) {
    const widthAndHeight = size.split('x');
    const withoutTopBar =
      parseInt(widthAndHeight[0]) -
      offset.x +
      'x' +
      (parseInt(widthAndHeight[1]) - offset.y);

    const ffmpegArgs = await buildX11FfmpegArgs({
      display,
      origin,
      size: withoutTopBar,
      filePath,
      framerate,
      crf,
      offset,
      threads
    });
    return startRecording(ffmpegArgs, nice, filePath);
  },
  /**
   * @returns A promise for a recording result, with a filePath property.
   */
  async stop(recording) {
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
