'use strict';

const log = require('intel').getLogger('browsertime.video');
const util = require('util');
const fs = require('fs');
const path = require('path');
const delay = ms => new Promise(res => setTimeout(res, ms));
const execa = require('execa');
const del = require('del');

const unlink = util.promisify(fs.unlink);

async function enableWindowRecorder(enable, driver) {
  if (enable) {
    enable = '1';
  } else {
    enable = '0';
  }

  // TODO:  Change this to use the priviledged JS api
  // that will eventually be implemented.
  const oldContext = driver.getContext();
  await driver.setContext('chrome');
  const script = 'windowUtils.setCompositionRecording(' + enable + ');';
  await driver.executeScript(script);
  return driver.setContext(oldContext);
}

function findRecordingDirectory(baseDir) {
  let closest_mtime = 0;
  let directory = undefined;

  fs.readdirSync(baseDir).forEach(file => {
    if (file.startsWith('windowrecording-')) {
      let fullPath = path.join(baseDir,file);
      let mtime = fs.statSync(fullPath).mtime;
      if (mtime > closest_mtime) {
        closest_mtime = mtime;
        directory = fullPath;
      }
    }
  });

  log.debug('Using window recording directory: ' + directory);
  return directory;
}

function writeFrameDurationsToFile(directoryName, imageFiles) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(
      path.join(directoryName, 'durations.txt')
    );
    stream.once('open', function() {
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

async function generateVideo(destination, baseDir) {
  let directoryName = findRecordingDirectory(baseDir);
  if (directoryName === undefined) {
    log.error('Could not find window recording directory in ' + baseDir);
  }
  let imageFiles = [];

  fs.readdirSync(directoryName).forEach(file => {
    // Format of the filenames are "frame-<num>-<offset>.png"
    // where num is frame number and offset is time since capture start in ms.
    let fields = file.split('-');
    let frameno = ('0000' + fields[1]).slice(-4);
    let newFilename = 'frame' + frameno + '.png';
    let offset = fields[2].split('.')[0];
    fs.copyFileSync(
      path.join(directoryName, file),
      path.join(directoryName, newFilename)
    );
    imageFiles.push({ filename: newFilename, offset: offset });
  });

  imageFiles.sort(function(a, b) {
    if (a.filename < b.filename) return -1;
    if (a.filename > b.filename) return 1;
    return 0;
  });
  await writeFrameDurationsToFile(directoryName, imageFiles);

  const vfr_args = [
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    path.join(directoryName, 'durations.txt'),
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
  del(directoryName);
}

module.exports = class FirefoxWindowRecorder {
  constructor(options, browser, baseDir) {
    this.options = options;
    this.browser = browser;
    this.baseDir = baseDir;
  }

  async start() {
    log.debug('Start firefox window recorder.');
    return enableWindowRecorder(true, this.browser.getDriver());
  }

  async stop(destination) {
    log.debug('Stop firefox window recorder.');
    await enableWindowRecorder(false, this.browser.getDriver());

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
    await generateVideo(destination, this.baseDir);
    log.debug(`Writing to ${destination}`);
  }
};
