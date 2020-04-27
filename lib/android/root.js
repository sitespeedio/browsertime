'use strict';

const log = require('intel').getLogger('browsertime.android');

// Adopted from
// https://dxr.mozilla.org/mozilla-central/source/testing/raptor/raptor/performance_tuning.py

const servicesToStop = ['mpdecision', 'thermal-engine', 'thermald'];
const animationsToStop = [
  'animator_duration_scale',
  'transition_animation_scale',
  'window_animation_scale'
];

class RootedDevice {
  constructor(androidClient) {
    this.client = androidClient;
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
      'echo 1 > sys/kernel/debug/msm-bus-dbg/shell-client/mas'
    );
    await this.client._runAsRoot(
      'echo 0 > /sys/kernel/debug/msm-bus-dbg/shell-client/a'
    );
    return this.client._runAsRoot(
      'echo 512 > /sys/kernel/debug/msm-bus-dbg/shell-client/slv'
    );
  }

  async setCPUPerformanceMotoG5() {
    for (let i = 0; i < 8; i++) {
      await this.client._runAsRoot(
        `echo performance > /sys/devices/system/cpu/cpu${i}/cpufreq/scaling_governor`
      );
      await this.client._runAsRoot(
        `echo 1401000 > /sys/devices/system/cpu/cpu${i}/cpufreq/scaling_min_freq`
      );
    }
  }

  async setGPUPerformance() {
    await this.client._runAsRoot('echo 0 > /sys/class/kgsl/kgsl-3d0/bus_split');
    await this.client._runAsRoot(
      'echo 1 > /sys/class/kgsl/kgsl-3d0/force_bus_on'
    );

    await this.client._runAsRoot(
      'echo 1  > /sys/class/kgsl/kgsl-3d0/force_rail_on'
    );

    await this.client._runAsRoot(
      'echo 1  > /sys/class/kgsl/kgsl-3d0/force_clk_on'
    );

    await this.client._runAsRoot(
      'echo 1  > /sys/class/kgsl/kgsl-3d0/force_no_nap'
    );

    return this.client._runAsRoot(
      'echo 1000000  > /sys/class/kgsl/kgsl-3d0/idle_timer'
    );
  }

  async setGPUPerformanceMotoG5() {
    await this.client._runAsRoot(
      'echo performance > /sys/devices/soc/1c00000.qcom,kgsl-3d0/devfreq/1c00000.qcom,kgsl-3d0/governor'
    );

    return this.client._runAsRoot(
      'echo 450 > /sys/devices/soc/1c00000.qcom,kgsl-3d0/kgsl/kgsl-3d0/min_clock_mhz'
    );
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

    if (model === 'Moto G (5)') {
      log.info('Set CPU and GPU performance settings for Moto G5');
      await this.setCPUPerformanceMotoG5();
      await this.setGPUPerformanceMotoG5();
    }
  }

  async stop() {
    await this.startServices();
    return this.startAnimations();
  }
}

module.exports = {
  RootedDevice
};
