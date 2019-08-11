'use strict';

const log = require('intel').getLogger('browsertime.video');
const get = require('lodash.get');
const util = require('util');
const fs = require('fs');
const ffmpegRecorder = require('./ffmpegRecorder');
const convert = require('./convert');
const defaults = require('../../defaults');
const getViewPort = require('../../../support/getViewPort');

const originFirefox = '0,71';
const originChrome = '0,66';
const offsetFirefox = { x: 0, y: 168 };
const offsetChrome = { x: 0, y: 66 };
const unlink = util.promisify(fs.unlink);

module.exports = class X11Recorder {
  constructor(options) {
    this.display = get(options, 'xvfbParams.display', defaults.xvfbDisplay);
    this.framerate = get(options, 'videoParams.framerate', defaults.framerate);
    this.nice = get(options, 'videoParams.nice', 0);
    this.crf = get(options, 'videoParams.crf', defaults.crf);
    this.viewPort = getViewPort(options);
    this.origin = options.browser === 'firefox' ? originFirefox : originChrome;
    this.offset = options.browser === 'firefox' ? offsetFirefox : offsetChrome;
    this.options = options;
  }

  async start(file) {
    this.filePath = file;

    this.recording = ffmpegRecorder.startRecordingX11({
      display: this.display,
      size: this.viewPort,
      filePath: this.filePath,
      origin: this.origin,
      offset: this.offset,
      framerate: this.framerate,
      crf: this.crf,
      nice: this.nice
    });

    return this.recording;
  }

  async stop(destination) {
    log.debug('Stop screen recording');
    await ffmpegRecorder.stopRecording(this.recording);
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
    try {
      await convert(this.filePath, destination, this.crf);
      await unlink(this.filePath);
    } catch (e) {
      log.error(
        'Converting the video failed. Converting from ' +
          this.filePath +
          ' to ' +
          destination
      );
      throw e;
    }

    log.debug(`Writing to ${destination}`);
  }
};
