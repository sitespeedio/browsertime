'use strict';

const log = require('intel');
const get = require('lodash.get');
const os = require('os');
const util = require('util');
const fs = require('fs');
const path = require('path');
const ffmpegRecorder = require('./ffmpegRecorder');
const convert = require('./convert');
const defaults = require('../../defaults');

const originFirefox = '0,71';
const originChrome = '0,66';
const offsetFirefox = { x: 0, y: 168 };
const offsetChrome = { x: 0, y: 66 };

async function createTempFile() {
  const mkdtemp = util.promisify(fs.mkdtemp);
  const dir = await mkdtemp(path.join(os.tmpdir(), 'browsertime-'));
  return path.join(dir, 'x11.mp4');
}

module.exports = class X11Recorder {
  constructor(options) {
    this.display = get(options, 'xvfbParams.display', defaults.xvfbDisplay);
    this.framerate = get(options, 'videoParams.framerate', defaults.framerate);
    this.crf = get(options, 'videoParams.crf', defaults.crf);
    this.viewPort = options.viewPort;
    this.origin = options.browser === 'firefox' ? originFirefox : originChrome;
    this.offset = options.browser === 'firefox' ? offsetFirefox : offsetChrome;
  }

  async start() {
    this.filePath = await createTempFile();

    this.recording = ffmpegRecorder.startRecordingX11({
      display: this.display,
      size: this.viewPort,
      filePath: this.filePath,
      origin: this.origin,
      offset: this.offset,
      framerate: this.framerate,
      crf: this.crf
    });

    return this.recording;
  }

  async stop(destination) {
    log.debug('Stop screen recording');
    await ffmpegRecorder.stopRecording(this.recording);
    // FIXME update to rename/move file
    await convert(this.filePath, destination, this.crf);
    // FIXME remove tmp folder

    log.debug(`Writing to ${destination}`);
  }
};
