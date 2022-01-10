'use strict';

const { promisify } = require('util');
const adb = require('@devicefarmer/adbkit');
const get = require('lodash.get');
const fs = require('fs');
const execa = require('execa');
const log = require('intel').getLogger('browsertime.android');
const mkdir = promisify(fs.mkdir);
const path = require('path');
const endOfLine = require('os').EOL;
const delay = ms => new Promise(res => setTimeout(res, ms));

class Android {
  constructor(options) {
    if (Android.instance) {
      // This is hack for https://github.com/sitespeedio/browsertime/issues/1239
      // In the long run we should rework how we use the Android object.
      Android.instance.port = options.devToolsPort;
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

    // Variables for android power testing
    this.screenBrightnessMode = 0;
    this.screenBrightness = 127;
    this.tmpDir = '/data/local/tmp/';

    return this;
  }

  async _init() {
    if (!this.id) {
      const devices = await this.client.listDevices();
      // just take the first phone online
      if (devices.length > 0) {
        this.id = devices[0].id;
      } else {
        throw Error('No Android phone was found');
      }
    }

    if (!this.sdcard) {
      this.sdcard = await this._runCommandAndGet('echo $EXTERNAL_STORAGE');
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

  async _runAsRootAndGet(command) {
    const data = await this.client.shell(
      this.id,
      'su - root -c "' + command + '"'
    );
    const output = await adb.util.readAll(data);
    return output.toString().trim();
  }

  async _runAsRoot(command) {
    const data = await this.client.shell(
      this.id,
      'su - root -c "' + command + ' && echo SUCCESS || echo FAIL"'
    );
    const output = await adb.util.readAll(data);
    const result = output.toString().trim();
    if (result === 'FAIL') {
      log.error('Failing running as root:' + command);
    }
    return result === 'SUCCESS';
  }

  async _downloadFile(sourcePath, destinationPath) {
    log.trace(`Pulling to ${destinationPath} from ${sourcePath}`);

    const transfer = await this.client.pull(this.id, sourcePath);

    return new Promise((resolve, reject) => {
      transfer.on('end', function () {
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
        await mkdir(fullDestinationPath, { recursive: true });
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

  async reboot() {
    await this.client.reboot(this.id);
    return delay(60000);
  }

  async getTemperature() {
    const temp = Number(
      await this._runCommandAndGet(
        `dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'`
      )
    );
    return temp / 10;
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
    const sourcePath = `${this.tmpDir}chromeNetlog.json`;
    log.info(`Pulling netlog from ${this.id}`);

    return this._downloadFile(sourcePath, destination);
  }

  async addDevtoolsFw() {
    return this.client.forward(
      this.id,
      'tcp:' + this.port,
      'localabstract:chrome_devtools_remote'
    );
  }

  async removeDevtoolsFw() {
    // We leak port forwards to devtools or rather Selenium/Chromedriver
    // So to handle that we need to remove them all for the running device
    // indstead of the one that we setup
    const { stdout } = await execa('adb', ['forward', '--list']);
    const allForwards = stdout.split(
      ' localabstract:chrome_devtools_remote' + endOfLine
    );

    const regex = /(tcp:\d)\w+/g;
    const closeThemAll = [];
    for (let fw of allForwards) {
      if (fw.indexOf(this.id) > -1) {
        const f = fw.match(regex);
        if (f.length > 0) {
          closeThemAll.push(
            execa('adb', ['-s', this.id, 'forward', '--remove', f[0]])
          );
        }
      }
    }
    // Remove forwards are missing in the adbkit
    return Promise.all(closeThemAll);
  }

  async startVideo() {
    return this._runCommand(
      `screenrecord --bit-rate 8000000 ${this.sdcard}/browsertime.mp4`
    );
  }

  async ping(address) {
    const result = await this._runCommandAndGet(`ping -c 1 ${address}`);
    if (result.indexOf('rtt') > -1) {
      return true;
    } else return false;
  }

  async clickPowerButton() {
    // Make sure the screen is not black
    return this._runCommand('input keyevent KEYCODE_POWER');
  }

  async getWifi() {
    const rawWifiInfo = await this._runCommand(
      `dumpsys netstats | grep -E 'iface=wlan.*networkId'`
    );
    const wifiInfo = (await adb.util.readAll(rawWifiInfo)).toString().trim();
    const wifi = wifiInfo.match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, '');
    return wifi;
  }

  async closeAppNotRespondingPopup() {
    const result = await this._runCommandAndGet('dumpsys window windows');
    if (result.indexOf('Application Not Responding') > -1) {
      await this._runCommand('input keyevent KEYCODE_DPAD_RIGHT');
      await this._runCommand('input keyevent KEYCODE_DPAD_RIGHT');
      return this._runCommand('input keyevent KEYCODE_ENTER');
    }
  }

  async stopVideo() {
    return this._runCommand(
      'command -v pkill >/dev/null && pkill -l SIGINT screenrecord || kill -2 $(ps screenrecord | grep -Eo [0-9]+ | grep -m 1 -Eo [0-9]+)'
    );
  }

  async getPhoneState() {
    const { stdout } = await execa('adb', ['-s', this.id, 'get-state']);
    return stdout;
  }

  async pullVideo(destinationPath) {
    const sourcePath = `${this.sdcard}/browsertime.mp4`;

    return this._downloadFile(sourcePath, destinationPath);
  }

  async removeVideo() {
    return this.removeFileOnSdCard(`${this.sdcard}/browsertime.mp4`);
  }

  async pidof(packageName) {
    // The same shell command on different devices may have different behaviors.
    // Therefore, if one command isn't working as expected, we try another one.
    for (const pidofMethodology of [this._pidofWithPidof, this._pidofWithPs]) {
      const pidofMethodologyWithThis = pidofMethodology.bind(this);
      const pid = await pidofMethodologyWithThis(packageName);
      if (pid) {
        return pid;
      }
    }

    return null;
  }

  async _pidofWithPidof(packageName) {
    // This method is expected to work on the Moto G5 and the Pixel 2.
    const cmd1 = `pidof ${packageName}`;
    log.debug(`pidof ${cmd1}`);
    const proc1 = await this._runCommand(cmd1);
    const ps1 = await adb.util.readAll(proc1);
    const ps = ps1.toString();
    log.debug(`pidof ${ps}`);

    if (
      ps &&
      // On some devices such as the Galaxy S5, pidof returns all active
      // pids (even with arguments) and isn't useful to us: we don't use
      // pidof in this case which we detect if there's a space (i.e. more
      // than one pid was returned).
      !ps.trim().includes(' ') &&
      !Number.isNaN(Number.parseInt(ps.trim()))
    ) {
      return Number.parseInt(ps.trim());
    }

    return null;
  }

  async _pidofWithPs(packageName) {
    // The ps output and accepted arguments change across devices so we work
    // with the most generic version of it by calling it without arguments.
    // We could also do the parsing more simply with shell commands but we
    // avoid them because they can have different behavior across devices.
    //
    // This method was tested on the Galaxy S5.
    const cmd = `ps`;
    log.debug(`pidof ${cmd}`);
    const proc = await this._runCommand(cmd);
    const psTemp = await adb.util.readAll(proc);
    const ps = psTemp.toString();
    log.debug(`pidof ${ps}`);

    const lines = ps.split(/[\r\n]+/);

    // Galaxy S5 example:
    // USER      PID   PPID  VSIZE  RSS   WCHAN            PC  NAME
    // root      1     0     3396   868   sys_epoll_ 00000000 S /init
    // ...
    const header = lines[0];
    const headerParts = header.split(/\s+/);
    const pidIndex = headerParts.indexOf('PID');

    // On the Galaxy S5, the process state column ("S" in the example above) is
    // unlabeled and comes before the package name. As such, we add one to the
    // index. However, on other devices such as the Pixel 2, this column is
    // labeled so we should not add 1. However, my hope is that simpler
    // methodologies like pidof work so we don't need to handle that here.
    const packageNameIndex = headerParts.indexOf('NAME') + 1;

    for (const line of ps.split(/[\r\n]+/)) {
      const lineParts = line.split(/\s+/);
      const processPackage = lineParts[packageNameIndex];
      const processPid = lineParts[pidIndex];
      if (processPackage !== packageName) {
        continue;
      }

      log.debug(`pidof ${line}`);
      const pid = Number.parseInt(processPid);
      if (pid && !Number.isNaN(pid)) {
        return pid;
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

    // It seems that `cut` is more common than `awk`, especially on older OS versions.  It's unclear
    // if $EPOCHREALTIME is more common than `date +%s%3N` support.  On the x86-7.0 emulator, date
    // only gives seconds.  In the future, we should try both methods for finding the date, and both
    // `cut` and `awk`, to make this more robust.
    const cut = `echo $EPOCHREALTIME && cut -d ' ' -f 1 /proc/uptime && cut -d ' ' -f 22 /proc/self/stat /proc/${pid}/stat`;
    // const awk = `date +%s%3N && awk '{print $1}' /proc/uptime && awk '{print $22}' /proc/self/stat /proc/${pid}/stat`;
    const statAndTimestamp = await this._runCommand(cut);
    const output = (await adb.util.readAll(statAndTimestamp)).toString();

    const [
      dateInS,
      systemUptimeInSeconds,
      utilStartTimeAfterSystemStartTimeInJiffies,
      processStartTimeAfterSystemStartTimeInJiffies
    ] = output
      .trim()
      .split(/[\r\n]+/)
      .map(v => Number.parseFloat(v.trim()));
    const dateInMs = Math.round(dateInS * 1000.0);

    // Usually 100, but this isn't strictly guaranteed by Android.
    const jiffesPerSeconds = Math.round(
      utilStartTimeAfterSystemStartTimeInJiffies / systemUptimeInSeconds
    );

    const processStartTimeInMs =
      dateInMs -
      MILLIS_PER_S * systemUptimeInSeconds +
      (processStartTimeAfterSystemStartTimeInJiffies * MILLIS_PER_S) /
        jiffesPerSeconds;

    const obj = {
      dateInMs,
      systemUptimeInSeconds,
      utilStartTimeAfterSystemStartTimeInJiffies,
      processStartTimeAfterSystemStartTimeInJiffies,
      jiffesPerSeconds,
      processStartTimeInMs
    };
    // log.debug(`_processStartTime`, obj); // Too verbose for regular use.

    return obj;
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

  async startPowerTesting() {
    log.info('Initializing power testing');

    // Disable adaptive brightness
    this.screenBrightnessMode = await this._runCommandAndGet(
      'settings get system screen_brightness_mode'
    );
    await this._runCommand('settings put system screen_brightness_mode 0');

    // Set screen brightness to 50%
    this.screenBrightness = await this._runCommandAndGet(
      'settings get system screen_brightness'
    );
    await this._runCommand('settings put system screen_brightness 127');
  }

  async stopPowerTesting() {
    log.info('Finalizing power testing');
    await this._runCommand(
      `settings put system screen_brightness ${this.screenBrightness}`
    );
    await this._runCommand(
      `settings put system screen_brightness_mode ${this.screenBrightnessMode}`
    );
  }

  async resetPowerUsage() {
    log.info('Resetting power information');
    await this._runCommand('dumpsys batterystats --reset');
    await this._runCommand('dumpsys batterystats --enable full-wake-history');
  }

  async measurePowerUsage(packageName) {
    const batterystats = await this._runCommandAndGet('dumpsys batterystats');
    return parsePowerMetrics(batterystats, packageName);
  }
}

async function parsePowerMetrics(batterystats, packageName) {
  const reUid = new RegExp(`.+proc=([^:]+):"${packageName}".*`);
  const reEstimations = new RegExp(`.+Estimated power use [(]mAh[)].*`);
  const reScreen = new RegExp(`.+Screen: ([0-9.]+).*`);
  const reWifi = new RegExp(`.+Wifi: ([0-9.]+).*`);

  let uid;
  let foundEstimations;
  let rePower;
  let found;
  let powerData = {};

  batterystats.split(/\r?\n/).forEach(line => {
    if (!uid) {
      // Find the applications UID first
      let match = line.match(reUid);
      if (match) {
        uid = match[1];
        rePower = new RegExp(`.+Uid ${uid}: ([0-9.]+)(.*)`);
      }
      return;
    }
    if (!foundEstimations) {
      // Ignore all lines until we find the estimation section
      let match = line.match(reEstimations);
      if (match) {
        foundEstimations = true;
      }
      return;
    }
    if (!('full-screen' in powerData)) {
      // Measures the full power used by the screen (not app-specific)
      let match = line.match(reScreen);
      if (match) {
        powerData['full-screen'] = parseFloat(match[1]);
      }
    }
    if (!('full-wifi' in powerData)) {
      // Measures the full power used by the wifi (not app-specific)
      let match = line.match(reWifi);
      if (match) {
        powerData['full-wifi'] = parseFloat(match[1]);
      }
    }
    if (rePower && !found) {
      // Searches for and parses an app-specific power usage line such as:
      // Uid u0a120: 0.826 ( cpu=0.826, wifi=99 )
      let match = line.match(rePower);
      if (!match) {
        return;
      }
      found = true;

      // First value is the total used by the app
      powerData['total'] = parseFloat(match[1]);

      // Gather the breakdown of the total value from
      // the "name=val" entries in the line
      let breakdown = match[2];
      if (breakdown) {
        match = breakdown.match(/([a-zA-Z]+)=([0-9.]+)/g);
        if (!match) {
          return;
        }
        match.forEach(category => {
          let [name, value] = category.split('=');
          powerData[name] = parseFloat(value);
        });
      }
    }
  });

  return powerData;
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
