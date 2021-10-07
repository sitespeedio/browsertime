'use strict';

const log = require('intel').getLogger('browsertime.video');
const util = require('util');
const fs = require('fs');
const path = require('path');
const execa = require('execa');
const { removeDirAndFiles } = require('../../../support/fileUtil');
const { Android } = require('../../../android');

const unlink = util.promisify(fs.unlink);

async function enableWindowRecorder(enable, browser) {
  if (enable) {
    enable = 'true';
  } else {
    enable = 'false';
  }

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
    'toggle composition recorder',
    undefined
  );
}

function findRecordingDirectory(baseDir) {
  let closest_mtime = 0;
  let directory = undefined;

  fs.readdirSync(baseDir).forEach(file => {
    if (file.startsWith('windowrecording-')) {
      let fullPath = path.join(baseDir, file);
      let mtime = fs.statSync(fullPath).mtime;
      if (mtime > closest_mtime) {
        closest_mtime = mtime;
        directory = fullPath;
      }
    }
  });

  log.debug('Using window recording directory: ' + directory);
  if (directory === undefined) {
    log.error('Could not find window recording directory in ' + baseDir);
  }
  return directory;
}

function findRecordingStartTime(recordingDir) {
  // Recording directory has the following format:
  // .../browsertime-results/<web address>/<date time>/windowrecording-<unix recording start time>
  return recordingDir.substr(recordingDir.lastIndexOf('-') + 1);
}

function findTimeToFirstFrame(recordingDir) {
  const files = fs.readdirSync(recordingDir);
  if (files === undefined || files.length < 1) {
    log.error('Could not find recordings in ' + recordingDir);
  } else {
    // Iterate through files, extract the time from the filenames, and return the smallest time
    return files.reduce((acc, fileName) => {
      const time = parseInt(fileName.split('-')[2].split('.')[0], 10);
      return Math.min(acc, time);
    }, Infinity);
  }
}

function writeFrameDurationsToFile(directoryName, imageFiles) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(
      path.join(directoryName, 'durations.txt')
    );
    stream.once('open', function () {
      stream.write(
        "file '" + path.join(directoryName, imageFiles[0].filename) + "'\n"
      );
      for (let i = 1; i < imageFiles.length; i++) {
        let duration = (imageFiles[i].offset - imageFiles[i - 1].offset) / 1000;
        stream.write('duration ' + duration.toString() + '\n');
        stream.write(
          "file '" + path.join(directoryName, imageFiles[i].filename) + "'\n"
        );
      }
      stream.end();
      stream.on('finish', () => {
        resolve(true);
      });
      stream.on('error', () => {
        reject(Error('Error writing durations to file.'));
      });
    });
  });
}

async function generateVideo(destination, recordingDirectoryName) {
  let imageFiles = [];

  fs.readdirSync(recordingDirectoryName).forEach(file => {
    // Format of the filenames are "frame-<num>-<offset>.png"
    // where num is frame number and offset is time since capture start in ms.
    let fields = file.split('-');
    let frameno = ('0000' + fields[1]).slice(-4);
    let newFilename = 'frame' + frameno + '.png';
    let offset = fields[2].split('.')[0];
    fs.copyFileSync(
      path.join(recordingDirectoryName, file),
      path.join(recordingDirectoryName, newFilename)
    );
    imageFiles.push({ filename: newFilename, offset: offset });
  });

  imageFiles.sort(function (a, b) {
    if (a.filename < b.filename) return -1;
    if (a.filename > b.filename) return 1;
    return 0;
  });
  await writeFrameDurationsToFile(recordingDirectoryName, imageFiles);

  const vfr_args = [
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
  log.debug('Executing command: ffmpeg ' + vfr_args.join(' '));
  await execa('ffmpeg', vfr_args);
  return removeDirAndFiles(recordingDirectoryName);
}

module.exports = class FirefoxWindowRecorder {
  constructor(options, browser, baseDir) {
    this.options = options;
    this.browser = browser;
    this.baseDir = baseDir;
    this.recordingStartTime = null;
    this.timeToFirstFrame = null;
  }

  async start() {
    log.info('Start firefox window recorder.');

    if (this.options.android) {
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

    if (this.options.android) {
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
      } catch (e) {
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
};
