import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execaCommand as command } from 'execa';
import { promisify } from 'node:util';
import { unlink as _unlink } from 'node:fs';
import { convert } from './convertToMp4.js';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.video');
const unlink = promisify(_unlink);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const moduleRootPath = path.resolve(__dirname, '..', '..', '..', '..');
const QVH = path.resolve(moduleRootPath, 'vendor', 'mac', 'x86', 'qvh');
const delay = ms => new Promise(res => setTimeout(res, ms));

export class IOSRecorder {
  constructor(options, baseDir) {
    this.options = options;
    this.uuid = options.safari.deviceUDID;
    this.tmpVideo = path.join(baseDir, 'tmp.h264');
    this.tmpSound = path.join(baseDir, 'tmp.wav');
  }

  static async activate() {
    log.debug('Activate configuration for IOS recorder.');
    return command(
      QVH + ' activate ' + (this.uuid ? '--udid=' + this.uuid + ' ' : ''),
      { shell: true }
    ).stdout.pipe(process.stdout);
  }

  async start() {
    log.info('Start IOS recorder.');

    this.qvhProcessProcess = command(
      QVH +
        ' record ' +
        (this.uuid ? '--udid=' + this.uuid + ' ' : '') +
        this.tmpVideo +
        ' ' +
        this.tmpSound,
      { shell: true }
    );
    /*
    // This is how we would run it using gstreamer
    this.qvhProcessProcess = execa.command(
      QVH +
        (this.uuid ? ' --udid=' + this.uuid + ' ' : '') +
        ` gstreamer --pipeline "mp4mux name=mux ! filesink location=${this.tmpVideo} queue name=audio_target ! wavparse ignore-length=true ! audioconvert ! faac ! aacparse ! mux. queue name=video_target ! h264parse ! vtdec ! videoconvert ! x264enc !  mux."`,
      { shell: true }
    );
    */
  }

  async stop(destination) {
    log.info('Stop IOS recorder.');

    await this.qvhProcessProcess.kill('SIGINT', {
      forceKillAfterTimeout: 5000
    });

    await delay(6000);
    await convert(this.tmpVideo, destination);
    await unlink(this.tmpVideo);
    await unlink(this.tmpSound);
    // await rename(this.tmpVideo, destination);
    return this.qvhProcessProcess;
  }
}
