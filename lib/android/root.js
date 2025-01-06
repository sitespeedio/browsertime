import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.android');

// Adopted from
// https://dxr.mozilla.org/mozilla-central/source/testing/raptor/raptor/performance_tuning.py

const servicesToStop = ['mpdecision', 'thermal-engine', 'thermald'];
const animationsToStop = [
  'animator_duration_scale',
  'transition_animation_scale',
  'window_animation_scale'
];

export class RootedDevice {
  constructor(androidClient, options) {
    this.client = androidClient;
    this.options = options;
  }

  async _setCPU(freq, policy, type) {
    return this.client._runAsRoot(
      `echo ${freq} > /sys/devices/system/cpu/cpufreq/policy${policy}/scaling_${type}_freq`
    );
  }

  async stopServices() {
    for (let service of servicesToStop) {
      await this.client._runAsRoot(`stop ${service}`);
    }
  }

  async startServices() {
    for (let service of servicesToStop) {
      await this.client._runAsRoot(`start ${service}`);
    }
  }

  async stopAnimations() {
    for (let animation of animationsToStop) {
      await this.client._runCommand(`settings put global ${animation} 0.0`);
    }
  }

  async startAnimations() {
    for (let animation of animationsToStop) {
      await this.client._runCommand(`settings put global ${animation} 1.0`);
    }
  }

  async setScheduler() {
    // Scheduler
    return this.client._runAsRoot('echo noop > /sys/block/sda/queue/scheduler');
  }

  async setVirtualMemory() {
    await this.client._runAsRoot('echo 0  > /proc/sys/vm/swappiness');
    await this.client._runAsRoot('echo 85  > /proc/sys/vm/dirty_ratio');
    return this.client._runAsRoot(
      'echo 70 > /proc/sys/vm/dirty_background_ratio'
    );
  }

  async settingKernel() {
    // Setting kernel
    await this.client._runAsRoot(
      'echo 1 > /sys/kernel/debug/msm-bus-dbg/shell-client/update_request'
    );
    await this.client._runAsRoot(
      'echo 1 > /sys/kernel/debug/msm-bus-dbg/shell-client/mas'
    );
    await this.client._runAsRoot(
      'echo 0 > /sys/kernel/debug/msm-bus-dbg/shell-client/a'
    );
    return this.client._runAsRoot(
      'echo 512 > /sys/kernel/debug/msm-bus-dbg/shell-client/slv'
    );
  }

  async setCPUPerformanceMotoG5() {
    //  # MSM8937(8x 1.4GHz)
    // values obtained from:
    // cat /sys/devices/system/cpu/cpu1/cpufreq/scaling_available_frequencies
    // 960000 1094400 1209600 1248000 1344000 1401000

    let cpuSpeed = 1_401_000;
    if (
      this.options.androidPinCPUSpeed === 'min' ||
      (this.options.android && this.options.android.pinCPUSpeed === 'min')
    ) {
      log.info('Set min CPU speed');
      cpuSpeed = 960_000;
    } else if (
      this.options.androidPinCPUSpeed === 'middle' ||
      (this.options.android && this.options.android.pinCPUSpeed === 'middle')
    ) {
      log.info('Set middle CPU speed');
      cpuSpeed = 1_209_600;
    } else {
      log.info('Set max CPU speed');
    }

    for (let index = 0; index < 8; index++) {
      await this.client._runAsRoot(
        `echo performance > /sys/devices/system/cpu/cpu${index}/cpufreq/scaling_governor`
      );
      await this.client._runAsRoot(
        `echo ${cpuSpeed} > /sys/devices/system/cpu/cpu${index}/cpufreq/scaling_min_freq`
      );
      await this.client._runAsRoot(
        `echo ${cpuSpeed} > /sys/devices/system/cpu/cpu${index}/cpufreq/scaling_max_freq`
      );
    }
  }

  async setCPUPerformanceSamsungA51() {
    // Octa-core (4x2.3 GHz Cortex-A73 & 4x1.7 GHz Cortex-A53)
    // See values by:
    // cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
    // cat /sys/devices/system/cpu/cpufreq/policy4/scaling_available_frequencies

    await this.client._runAsRoot(
      'echo performance > /sys/devices/system/cpu/cpufreq/policy0/scaling_governor'
    );

    await this.client._runAsRoot(
      'echo performance > /sys/devices/system/cpu/cpufreq/policy4/scaling_governor'
    );

    // For the Samsung A51 we can choose min/middle or max CPU speed

    // Collect the current settings
    const currentMaxPolicy0 = await this.client._runAsRootAndGet(
      'cat /sys/devices/system/cpu/cpufreq/policy0/scaling_max_freq'
    );
    const currentMinPolicy0 = await this.client._runAsRootAndGet(
      'cat /sys/devices/system/cpu/cpufreq/policy0/scaling_min_freq'
    );
    const currentMaxPolicy4 = await this.client._runAsRootAndGet(
      'cat /sys/devices/system/cpu/cpufreq/policy4/scaling_max_freq'
    );
    const currentMinPolicy4 = await this.client._runAsRootAndGet(
      'cat /sys/devices/system/cpu/cpufreq/policy4/scaling_min_freq'
    );

    if (
      this.options.androidPinCPUSpeed === 'min' ||
      (this.options.android && this.options.android.pinCPUSpeed === 'min')
    ) {
      log.info('Set min CPU speed');

      // The min settings, see the possible slowest setting by
      // cat /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
      const minPolicy0 = 403_000;
      const minPolicy4 = 936_000;

      // You need to set them in the correct order
      if (Number(currentMinPolicy0) > minPolicy0) {
        await this._setCPU(minPolicy0, '0', 'min');
        await this._setCPU(minPolicy0, '0', 'max');
      } else {
        await this._setCPU(minPolicy0, '0', 'max');
        await this._setCPU(minPolicy0, '0', 'min');
      }

      if (Number(currentMinPolicy4) > minPolicy4) {
        await this._setCPU(minPolicy4, '4', 'min');
        return this._setCPU(minPolicy4, '4', 'max');
      } else {
        await this._setCPU(minPolicy4, '4', 'max');
        return this._setCPU(minPolicy4, '4', 'min');
      }
    } else if (
      this.options.androidPinCPUSpeed === 'middle' ||
      (this.options.android && this.options.android.pinCPUSpeed === 'middle')
    ) {
      log.info('Set middle CPU speed');

      const middlePolicy0 = 910_000;
      const middlePolicy4 = 1_508_000;

      if (Number(currentMaxPolicy0) > middlePolicy0) {
        await this._setCPU(middlePolicy0, '0', 'min');
        await this._setCPU(middlePolicy0, '0', 'max');
      } else {
        await this._setCPU(middlePolicy0, '0', 'max');
        await this._setCPU(middlePolicy0, '0', 'min');
      }

      if (Number(currentMaxPolicy4) > middlePolicy4) {
        await this._setCPU(middlePolicy4, '4', 'min');
        return this._setCPU(middlePolicy4, '4', 'max');
      } else {
        await this._setCPU(middlePolicy4, '4', 'max');
        return this._setCPU(middlePolicy4, '4', 'min');
      }
    } else {
      log.info('Set max CPU speed');

      const maxPolicy0 = 1_742_000;
      const maxPolicy4 = 2_314_000;

      // set it to max speed
      await this._setCPU(maxPolicy0, '0', 'max');
      await this._setCPU(maxPolicy0, '0', 'min');
      await this._setCPU(maxPolicy4, '4', 'max');
      return this._setCPU(maxPolicy4, '4', 'min');
    }
  }

  async setCPUPerformancePixel2() {
    // MSM8998 (4x 2.35GHz, 4x 1.9GHz)
    // values obtained from:
    //  /sys/devices/system/cpu/cpufreq/policy0/scaling_available_frequencies
    //  /sys/devices/system/cpu/cpufreq/policy4/scaling_available_frequencies
    await this.client._runAsRoot(
      'echo performance > /sys/devices/system/cpu/cpufreq/policy0/scaling_governor'
    );

    await this.client._runAsRoot(
      'echo performance > /sys/devices/system/cpu/cpufreq/policy4/scaling_governor'
    );

    await this.client._runAsRoot(
      'echo 1900800 > /sys/devices/system/cpu/cpufreq/policy0/scaling_min_freq'
    );

    return this.client._runAsRoot(
      'echo 2457600 > /sys/devices/system/cpu/cpufreq/policy4/scaling_min_freq'
    );
  }

  async setGPUPerformance() {
    await this.client._runAsRoot('echo 0 > /sys/class/kgsl/kgsl-3d0/bus_split');
    await this.client._runAsRoot(
      'echo 1 > /sys/class/kgsl/kgsl-3d0/force_bus_on'
    );

    await this.client._runAsRoot(
      'echo 1 > /sys/class/kgsl/kgsl-3d0/force_rail_on'
    );

    await this.client._runAsRoot(
      'echo 1 > /sys/class/kgsl/kgsl-3d0/force_clk_on'
    );

    await this.client._runAsRoot(
      'echo 1 > /sys/class/kgsl/kgsl-3d0/force_no_nap'
    );

    return this.client._runAsRoot(
      'echo 1000000 > /sys/class/kgsl/kgsl-3d0/idle_timer'
    );
  }

  async setGPUPerformanceMotoG5() {
    // Adreno 505 (450MHz)
    // values obtained from:
    // sys/devices/soc/1c00000.qcom,kgsl-3d0/kgsl/kgsl-3d0/max_clock_mhz

    const governor = await this.client._runAsRootAndGet(
      'cat /sys/devices/soc/1c00000.qcom,kgsl-3d0/devfreq/1c00000.qcom,kgsl-3d0/governor'
    );
    // Only set it if it isn't set
    if (governor !== 'performance') {
      await this.client._runAsRoot(
        'echo performance > /sys/devices/soc/1c00000.qcom,kgsl-3d0/devfreq/1c00000.qcom,kgsl-3d0/governor'
      );
    }

    return this.client._runAsRoot(
      'echo 450 > /sys/devices/soc/1c00000.qcom,kgsl-3d0/kgsl/kgsl-3d0/min_clock_mhz'
    );
  }

  async setGPUPerformancePixel2() {
    // Adreno 540 (710MHz)
    // values obtained from:
    // /sys/devices/soc/5000000.qcom,kgsl-3d0/kgsl/kgsl-3d0/max_clk_mhz

    await this.client._runAsRoot(
      'echo performance > /sys/devices/soc/5000000.qcom,kgsl-3d0/devfreq/5000000.qcom,kgsl-3d0/governor'
    );

    await this.client._runAsRoot(
      'echo performance > /sys/devices/soc/soc:qcom,kgsl-busmon/devfreq/soc:qcom,kgsl-busmon/governor'
    );

    return this.client._runAsRoot(
      'echo 710 > /sys/devices/soc/5000000.qcom,kgsl-3d0/kgsl/kgsl-3d0/min_clock_mhz'
    );
  }

  async setGPUPerformanceSamsungA51() {
    // Mali-G72 MP3 (3 @ 850 MHz)
    // Missing info on how to set the GPU
  }

  async start() {
    await this.stopServices();
    await this.stopAnimations();
    await this.setScheduler();
    await this.setVirtualMemory();
    await this.settingKernel();
    await this.setGPUPerformance();

    const model = await this.client._runCommandAndGet(
      `getprop ro.product.model`
    );

    switch (model) {
      case 'Moto G (5)': {
        log.info('Set CPU and GPU performance settings for Moto G5');
        await this.setCPUPerformanceMotoG5();
        await this.setGPUPerformanceMotoG5();

        break;
      }
      case 'Pixel 2': {
        log.info('Set CPU and GPU performance settings for Pixel 2');
        await this.setCPUPerformancePixel2();
        await this.setGPUPerformancePixel2();

        break;
      }
      case 'SM-A515F': {
        // Samsung A51
        await this.setCPUPerformanceSamsungA51();
        await this.setGPUPerformanceSamsungA51();

        break;
      }
      default: {
        log.info(
          'No specific CPU/GPU settings for %s - you can help out by creating a PR at https://github.com/sitespeedio/browsertime for your phone',
          model
        );
      }
    }
  }

  async stop() {
    await this.startServices();
    return this.startAnimations();
  }
}
