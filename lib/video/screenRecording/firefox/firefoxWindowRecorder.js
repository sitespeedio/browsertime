import { promisify } from 'node:util';
import {
  unlink as _unlink,
  readdirSync,
  statSync,
  createWriteStream,
  copyFileSync
} from 'node:fs';
import path from 'node:path';
import { getLogger } from '@sitespeed.io/log';
import { execa } from 'execa';
import { removeDirAndFiles } from '../../../support/fileUtil.js';
import { Android, isAndroidConfigured } from '../../../android/index.js';
const log = getLogger('browsertime.video');

const unlink = promisify(_unlink);

async function enableWindowRecorder(enable, browser) {
  enable = enable ? 'true' : 'false';

  // We wrap windowUtils.setCompositionRecording(...) in Promise.resolve() to
  // work on both the older (synchronous) and newer (asynchronous)
  // setCompositionRecorder API.
  const script = `\
      const cb = arguments[arguments.length-1];
      Promise.resolve(
        windowUtils.setCompositionRecording(${enable})
      )
        .then(() => cb());
  `;

  return browser.runPrivilegedAsyncScript(
    script,
    'toggle composition recorder'
  );
}

function findRecordingDirectory(baseDir) {
  let closest_mtime = 0;
  let directory;

  for (const file of readdirSync(baseDir)) {
    if (file.startsWith('windowrecording-')) {
      let fullPath = path.join(baseDir, file);
      let mtime = statSync(fullPath).mtime;
      if (mtime > closest_mtime) {
        closest_mtime = mtime;
        directory = fullPath;
      }
    }
  }

  log.debug('Using window recording directory: ' + directory);
  if (directory === undefined) {
    log.error('Could not find window recording directory in ' + baseDir);
  }
  return directory;
}

function findRecordingStartTime(recordingDir) {
  // Recording directory has the following format:
  // .../browsertime-results/<web address>/<date time>/windowrecording-<unix recording start time>
  return recordingDir.slice(recordingDir.lastIndexOf('-') + 1);
}

function findTimeToFirstFrame(recordingDir) {
  const files = readdirSync(recordingDir);
  if (files === undefined || files.length === 0) {
    log.error('Could not find recordings in ' + recordingDir);
  } else {
    // Iterate through files, extract the time from the filenames, and return the smallest time
    // eslint-disable-next-line unicorn/no-array-reduce
    return files.reduce((accumulator, fileName) => {
      const time = Number.parseInt(fileName.split('-')[2].split('.')[0], 10);
      return Math.min(accumulator, time);
    }, Number.POSITIVE_INFINITY);
  }
}

function writeFrameDurationsToFile(directoryName, imageFiles) {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(path.join(directoryName, 'durations.txt'));
    stream.once('open', function () {
      stream.write(
        "file '" + path.join(directoryName, imageFiles[0].filename) + "'\n"
      );
      for (let index = 1; index < imageFiles.length; index++) {
        let duration =
          (imageFiles[index].offset - imageFiles[index - 1].offset) / 1000;
        stream.write('duration ' + duration.toString() + '\n');
        stream.write(
          "file '" +
            path.join(directoryName, imageFiles[index].filename) +
            "'\n"
        );
      }
      stream.end();
      stream.on('finish', () => {
        resolve(true);
      });
      stream.on('error', () => {
        reject(new Error('Error writing durations to file.'));
      });
    });
  });
}

async function generateVideo(destination, recordingDirectoryName) {
  let imageFiles = [];

  for (const file of readdirSync(recordingDirectoryName)) {
    // Format of the filenames are "frame-<num>-<offset>.png"
    // where num is frame number and offset is time since capture start in ms.
    let fields = file.split('-');
    let frameno = ('0000' + fields[1]).slice(-4);
    let newFilename = 'frame' + frameno + '.png';
    let offset = fields[2].split('.')[0];
    copyFileSync(
      path.join(recordingDirectoryName, file),
      path.join(recordingDirectoryName, newFilename)
    );
    imageFiles.push({ filename: newFilename, offset: offset });
  }

  imageFiles.sort(function (a, b) {
    if (a.filename < b.filename) return -1;
    if (a.filename > b.filename) return 1;
    return 0;
  });
  await writeFrameDurationsToFile(recordingDirectoryName, imageFiles);

  const vfr_arguments = [
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    path.join(recordingDirectoryName, 'durations.txt'),
    '-vf',
    'pad=ceil(iw/2)*2:ceil(ih/2)*2',
    '-vsync',
    'vfr',
    '-pix_fmt',
    'yuv420p',
    destination
  ];
  log.debug('Executing command: ffmpeg ' + vfr_arguments.join(' '));
  await execa('ffmpeg', vfr_arguments);
  return removeDirAndFiles(recordingDirectoryName);
}

export class FirefoxWindowRecorder {
  constructor(options, browser, baseDir) {
    this.options = options;
    this.browser = browser;
    this.baseDir = baseDir;
    this.recordingStartTime = undefined;
    this.timeToFirstFrame = undefined;
  }

  async start() {
    log.info('Start firefox window recorder.');

    if (isAndroidConfigured(this.options)) {
      this.android = new Android(this.options);
      await this.android.removePathOnSdCard(
        'browsertime-firefox-windowrecording'
      );
      await this.android.mkDirOnSdCard('browsertime-firefox-windowrecording');
    }

    return enableWindowRecorder(true, this.browser);
  }

  async stop(destination) {
    log.info('Stop firefox window recorder.');
    await enableWindowRecorder(false, this.browser);

    if (isAndroidConfigured(this.options)) {
      const fullPathOnSdCard = this.android.getFullPathOnSdCard(
        'browsertime-firefox-windowrecording'
      );
      await this.android._downloadDir(fullPathOnSdCard, this.baseDir);
    }

    // FIXME update to rename/move file
    // The destination file could exixt of we use --resultDir
    // so make sure we remove it first
    if (this.options.resultDir) {
      try {
        await unlink(destination);
      } catch {
        // Nothing to see here
      }
    }

    let recordingDir = findRecordingDirectory(this.baseDir);
    this.recordingStartTime = findRecordingStartTime(recordingDir);
    this.timeToFirstFrame = findTimeToFirstFrame(recordingDir);
    await generateVideo(
      destination,
      recordingDir,
      this.recordingStartTime,
      this.timeToFirstFrame
    );
    log.debug(`Writing to ${destination}`);
  }
}
