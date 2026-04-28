import path from 'node:path';
import fs from 'node:fs';
import { getLogger } from '@sitespeed.io/log';

const log = getLogger('browsertime.video');

/**
 * Records the screen of an iOS device connected via USB.
 *
 * Uses the ios-capture server process that was started by the
 * Safari delegate in beforeBrowserStart(). The server accepts
 * START/STOP commands via stdin to control recording per iteration.
 */
export class IOSDeviceRecorder {
  constructor(options, baseDir) {
    this.options = options;
    this.baseDir = baseDir;
    this.responseBuffer = '';
  }

  /**
   * Start recording to a temporary file.
   */
  async start() {
    const captureProcess = this.options._iosCaptureProcess;
    if (!captureProcess) {
      log.error('ios-capture server not running');
      return;
    }

    // Set up response listener if not already done
    if (!this._listeningForResponses) {
      captureProcess.stdout.on('data', data => {
        this.responseBuffer += data.toString();
      });
      this._listeningForResponses = true;
    }

    const tmpVideo = path.join(this.baseDir, 'ios-tmp-video.mp4');
    this.tmpVideo = tmpVideo;

    captureProcess.stdin.write(`START ${tmpVideo}\n`);

    // Wait for RECORDING response
    await this._waitForResponse('RECORDING', 10_000);
    log.debug('iOS recording started');
  }

  /**
   * Stop the current recording and move the video to the destination.
   */
  async stop(destination) {
    log.debug('Stop iOS device recorder');

    const captureProcess = this.options._iosCaptureProcess;
    if (captureProcess) {
      captureProcess.stdin.write('STOP\n');
      await this._waitForResponse('STOPPED', 10_000);
    }

    // Wait for ffmpeg to finish writing
    await new Promise(r => setTimeout(r, 1000));

    if (!destination) {
      return;
    }

    try {
      await fs.promises.rename(this.tmpVideo, destination);
    } catch {
      try {
        await fs.promises.copyFile(this.tmpVideo, destination);
        await fs.promises.unlink(this.tmpVideo);
      } catch (error) {
        log.error('Could not move video: %s', error.message);
      }
    }

    log.debug('Video saved to %s', destination);
  }

  /**
   * Wait for a specific response from ios-capture stdout.
   */
  async _waitForResponse(expected, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (this.responseBuffer.includes(expected)) {
        const index = this.responseBuffer.indexOf(expected);
        this.responseBuffer = this.responseBuffer
          .slice(index + expected.length)
          .trim();
        return true;
      }
      if (this.responseBuffer.includes('ERROR')) {
        const errorMsg = this.responseBuffer.trim();
        this.responseBuffer = '';
        throw new Error(`ios-capture error: ${errorMsg}`);
      }
      await new Promise(r => setTimeout(r, 100));
    }
    log.error(
      'Timeout waiting for "%s" from ios-capture (buffer: %s)',
      expected,
      this.responseBuffer
    );
    return false;
  }
}
