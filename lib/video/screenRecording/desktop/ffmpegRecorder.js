import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
import { getScreenOnOSX } from './osx/getScreen.js';
import { getSPDisplaysDataType } from './osx/getSPDisplaysDataType.js';
const log = getLogger('browsertime.video');

async function buildX11FfmpegArguments({
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
    let devicePixelRatio = SPDisplaysDataType.includes('Retina') ? 2 : 1;
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

async function startRecording(ffmpegArguments, nice, taskset, filePath) {
  async function waitForRecording(readableStream) {
    return new Promise((resolve, reject) => {
      readableStream.on('data', data => {
        log.verbose(data.toString());
        if (/Press \[q] to stop/.test(data.toString())) {
          // readableStream.removeAllListeners('data');
          return resolve();
        }
      });
      readableStream.once('error', reject);
    });
  }
  let ffmpegProcess;
  if (taskset) {
    log.debug('Start FFMPEG with taskset cpulist %j', taskset);
    ffmpegArguments.unshift('ffmpeg');
    ffmpegArguments.unshift(`${taskset}`);
    ffmpegArguments.unshift('-c');
    log.debug('Start FFMPEG with %j', ffmpegArguments);
    ffmpegProcess = execa('taskset', ffmpegArguments);
  } else if (nice === 0) {
    log.debug('Start FFMPEG with %j', ffmpegArguments);
    ffmpegProcess = execa('ffmpeg', ffmpegArguments);
  } else {
    ffmpegArguments.unshift('ffmpeg');
    ffmpegArguments.unshift(`${nice}`);
    ffmpegArguments.unshift('-n');
    log.debug('Start FFMPEG with %j', ffmpegArguments);
    ffmpegProcess = execa('nice', ffmpegArguments);
  }

  // Race to catch if ffmpeg exists early, or if recording has started
  return Promise.race([ffmpegProcess, waitForRecording(ffmpegProcess.stderr)])
    .then(() => {
      log.debug('Started ffmpeg with ' + ffmpegArguments.join(' '));

      return {
        filePath,
        ffmpegProcess
      };
    })
    .catch(error => {
      log.error(error);
      throw error;
    });
}

export /**
 * @returns A promise for a recording object. Pass it to stopRecording.
 */
async function start({
  display,
  origin,
  size,
  filePath,
  offset,
  framerate,
  crf,
  nice,
  threads,
  taskset
}) {
  const widthAndHeight = size.split('x');
  const withoutTopBar =
    Number.parseInt(widthAndHeight[0]) -
    offset.x +
    'x' +
    (Number.parseInt(widthAndHeight[1]) - offset.y);

  const ffmpegArguments = await buildX11FfmpegArguments({
    display,
    origin,
    size: withoutTopBar,
    filePath,
    framerate,
    crf,
    offset,
    threads
  });
  return startRecording(ffmpegArguments, nice, taskset, filePath);
}
export /**
 * @returns A promise for a recording result, with a filePath property.
 */
async function stop(recording) {
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
