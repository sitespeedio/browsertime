import { promisify } from 'node:util';
import { unlink as _unlink, rename as _rename } from 'node:fs';
import { getLogger } from '@sitespeed.io/log';
import { start as _start, stop as _stop } from './ffmpegRecorder.js';
import { convert } from './convert.js';
import {
  xvfbDisplay,
  framerate as _framerate,
  crf as _crf,
  convert as _convert,
  threads as _threads
} from '../../defaults.js';
import { getViewPort } from '../../../support/getViewPort.js';
import { getProperty } from '../../../support/util.js';

const unlink = promisify(_unlink);
const rename = promisify(_rename);
const log = getLogger('browsertime.video');

export class DesktopRecorder {
  constructor(options) {
    this.display = getProperty(options, 'xvfbParams.display', xvfbDisplay);
    this.framerate = getProperty(options, 'videoParams.framerate', _framerate);
    this.nice = getProperty(options, 'videoParams.nice', 0);
    this.crf = getProperty(options, 'videoParams.crf', _crf);
    this.convert = getProperty(options, 'videoParams.convert', _convert);
    this.threads = getProperty(options, 'videoParams.threads', _threads);
    this.viewPort = getViewPort(options);
    this.taskset = getProperty(options, 'videoParams.taskset');
    this.origin = '0,0';
    this.offset = { x: 0, y: 0 };
    this.options = options;
  }

  async start(file) {
    this.filePath = file;

    this.recording = _start({
      display: this.display,
      size: this.viewPort,
      filePath: this.filePath,
      origin: this.origin,
      offset: this.offset,
      framerate: this.framerate,
      crf: this.crf,
      nice: this.nice,
      threads: this.threads,
      taskset: this.taskset
    });

    return this.recording;
  }

  async stop(destination) {
    log.debug('Stop screen recording');
    await _stop(this.recording);

    // This was a test with and error and probably not a navigation
    // The user script use stopAsError
    if (!destination) {
      return;
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
    try {
      if (this.convert) {
        await convert(this.filePath, destination, this.crf, this.threads);
        await unlink(this.filePath);
      } else {
        await rename(this.filePath, destination);
      }
    } catch (error) {
      log.error(
        'Converting the video failed. Converting from ' +
          this.filePath +
          ' to ' +
          destination
      );
      throw error;
    }
    log.debug(`Writing to ${destination}`);
  }
}
