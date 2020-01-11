'use strict';

const { promisify } = require('util');
const adb = require('adbkit');
const get = require('lodash.get');
const fs = require('fs');
const execa = require('execa');
const log = require('intel').getLogger('browsertime.android');
const mkdirp = promisify(require('mkdirp'));
const path = require('path');

class Android {
  constructor(options) {
    if (Android.instance) {
      return Android.instance;
    }

    Android.instance = this;
    this.client = adb.createClient();
    this.id = get(
      options,
      'chrome.android.deviceSerial',
      get(options, 'firefox.android.deviceSerial')
    );
    this.port = options.devToolsPort;
    return this;
  }

  async _init() {
    if (!this.id) {
      const devices = await this.client.listDevices();
      // just take the first phone online
      this.id = devices[0].id;
    }

    if (!this.sdcard) {
      this.sdcard = await this._runCommandAndGet('echo $EXTERNAL_STORAGE');
    }

    if (!this.forward) {
      return this.client.forward(
        this.id,
        'tcp:' + this.port,
        'localabstract:chrome_devtools_remote'
      );
    }
  }

  async _runCommand(command) {
    return this.client.shell(this.id, command);
  }

  async _runCommandAndGet(command) {
    const data = await this.client.shell(this.id, command);
    const output = await adb.util.readAll(data);
    return output.toString().trim();
  }

  async _downloadFile(sourcePath, destinationPath) {
    log.trace(`Pulling to ${destinationPath} from ${sourcePath}`);

    const transfer = await this.client.pull(this.id, sourcePath);

    return new Promise((resolve, reject) => {
      transfer.on('end', function() {
        resolve();
      });
      transfer.on('error', reject);
      transfer.pipe(fs.createWriteStream(destinationPath));
    });
  }

  async _downloadDir(sourcePath, destinationPath) {
    const files = await this.client.readdir(this.id, sourcePath);

    for (const file of files) {
      const fullSourcePath = `${sourcePath}/${file.name}`;
      const fullDestinationPath = path.join(destinationPath, file.name);

      if (file.isFile()) {
        await this._downloadFile(fullSourcePath, fullDestinationPath);
      } else if (file.isDirectory()) {
        await mkdirp(fullDestinationPath);
        await this._downloadDir(fullSourcePath, fullDestinationPath);
      }
    }
  }

  getFullPathOnSdCard(path) {
    return `${this.sdcard}/${path}`;
  }

  async mkDirOnSdCard(dirName) {
    const command = `mkdir ${this.sdcard}/${dirName}`;
    return this._runCommand(command);
  }

  async removeFileOnSdCard(file) {
    const command = `rm -- "${this.sdcard}/${file}"`;
    if (!this.sdcard || !file) {
      throw new Error(`Refusing to execute command: '${command}'`);
    }
    return this._runCommand(command);
  }

  async removePathOnSdCard(path) {
    const command = `rm -rf -- "${this.sdcard}/${path}"`;
    if (!this.sdcard || !path) {
      throw new Error(`Refusing to execute command: '${command}'`);
    }
    return this._runCommand(command);
  }

  async getModel() {
    const rawModel = await this._runCommand(`getprop ro.product.model`);
    const model = (await adb.util.readAll(rawModel)).toString().trim();
    const rawName = await this._runCommand(`getprop ro.product.name`);
    const name = (await adb.util.readAll(rawName)).toString().trim();
    const rawDevice = await this._runCommand(`getprop ro.product.device`);
    const device = (await adb.util.readAll(rawDevice)).toString().trim();
    const rawRelease = await this._runCommand(
      `getprop ro.build.version.release `
    );
    const androidVersion = (await adb.util.readAll(rawRelease))
      .toString()
      .trim();
    return { model, name, device, androidVersion };
  }

  async pullNetLog(destination) {
    const sourcePath = `${this.sdcard}/chromeNetlog.json`;
    log.info(`Pulling netlog from ${this.id}`);

    return this._downloadFile(sourcePath, destination);
  }

  async removeFw() {
    // Remove forwards are missing in the adbkit
    return execa('adb', [
      '-s',
      this.id,
      'forward',
      '--remove',
      'tcp:' + this.port
    ]);
  }

  async startVideo() {
    return this._runCommand(
      `screenrecord --bit-rate 8000000 ${this.sdcard}/browsertime.mp4`
    );
  }

  async stopVideo() {
    return this._runCommand(
      'command -v pkill >/dev/null && pkill -l SIGINT screenrecord || kill -2 $(ps screenrecord | grep -Eo [0-9]+ | grep -m 1 -Eo [0-9]+)'
    );
  }

  async pullVideo(destinationPath) {
    const sourcePath = `${this.sdcard}/browsertime.mp4`;

    return this._downloadFile(sourcePath, destinationPath);
  }

  async pidof(packageName) {
    const cmd1 = `pidof ${packageName}`;
    log.debug(`pidof ${cmd1}`);
    const proc1 = await this._runCommand(cmd1);
    const ps1 = await adb.util.readAll(proc1);
    let ps = ps1.toString();
    log.debug(`pidof ${ps}`);

    if (ps && !Number.isNaN(Number.parseInt(ps.trim()))) {
      return Number.parseInt(ps.trim());
    }

    const cmd2 = `ps -o PID,NAME | grep ' ${packageName}$'`;
    log.debug(`pidof ${cmd2}`);
    const proc2 = await this._runCommand(cmd2);
    const ps2 = await adb.util.readAll(proc2);
    ps = ps2.toString();
    log.debug(`pidof ${ps}`);

    for (const line in ps.split(/[\r\n]+/)) {
      const parts = line.trim().split(' ');
      if (
        parts.length == 2 &&
        parts[0] === packageName &&
        !Number.isNaN(Number.parseInt(parts[1].trim()))
      ) {
        return Number.parseInt(parts[1].trim());
      }
    }

    return null;
  }

  async _processStartTime(pid) {
    // See https://stackoverflow.com/a/26538424 and others for
    // determining process start time.  See
    // https://stackoverflow.com/a/44524937 for determining USER_HZ
    // (Linux kernel jiffies per second) without using syscall.  See
    // https://stackoverflow.com/questions/16548528/command-to-get-time-in-milliseconds#comment33215571_16548827
    // for the date formatting trick.
    const MILLIS_PER_S = 1000;

    const awk = `date +%s%3N && awk '{print $1}' /proc/uptime && awk '{print $22}' /proc/self/stat /proc/${pid}/stat`;
    const statAndTimestamp = await this._runCommand(awk);
    const output = (await adb.util.readAll(statAndTimestamp)).toString();

    const [
      dateInMs,
      systemUptimeInSeconds,
      awkStartTimeAfterSystemStartTimeInJiffies,
      processStartTimeAfterSystemStartTimeInJiffies
    ] = output
      .trim()
      .split(/[\r\n]+/)
      .map(v => Number.parseFloat(v.trim()));

    // Usually 100, but this isn't strictly guaranteed by Android.
    const jiffesPerSeconds = Math.round(
      awkStartTimeAfterSystemStartTimeInJiffies / systemUptimeInSeconds
    );

    const processStartTimeInMs =
      dateInMs -
      MILLIS_PER_S * systemUptimeInSeconds +
      (processStartTimeAfterSystemStartTimeInJiffies * MILLIS_PER_S) /
        jiffesPerSeconds;

    return {
      dateInMs,
      systemUptimeInSeconds,
      awkStartTimeAfterSystemStartTimeInJiffies,
      processStartTimeAfterSystemStartTimeInJiffies,
      jiffesPerSeconds,
      processStartTimeInMs
    };
  }

  async processStartTime(pid, count = 3) {
    // This is inheritently racy and therefore noisy.  Average `count` trials.
    let total = 0;
    for (let i = 0; i < count; i++) {
      const obj = await this._processStartTime(pid);
      total += obj.processStartTimeInMs;
    }
    return Math.round(total / count);
  }
}

module.exports = {
  Android,
  isAndroidConfigured(options) {
    if (options.android === true) {
      return true;
    }
    return get(
      options,
      'chrome.android.package',
      get(options, 'firefox.android.package', false)
    )
      ? true
      : false;
  }
};
