import { readFile, readdir } from 'node:fs/promises';

const CPU_DIRECTORY = '/sys/devices/system/cpu';

export function parseCpuTimes(procStat) {
  // Use user, nice, system, idle, iowait, irq, softirq and steal.
  // The guest time is already part of the user time.
  const times = procStat
    .split('\n')[0]
    .trim()
    .split(/\s+/)
    .slice(1, 9)
    .map(Number);
  return { total: times.reduce((a, b) => a + b, 0), steal: times[7] };
}

async function readThrottleCount() {
  let count;
  try {
    const files = await readdir(CPU_DIRECTORY);
    const cpus = files.filter(name => /^cpu\d+$/.test(name));
    for (const cpu of cpus) {
      const file = `${CPU_DIRECTORY}/${cpu}/thermal_throttle/core_throttle_count`;
      count = (count ?? 0) + Number(await readFile(file, 'utf8'));
    }
  } catch {
    // Virtual machines and CPUs that are not Intel do not have this file
    return;
  }
  return count;
}

export async function sampleCpu() {
  return {
    ...parseCpuTimes(await readFile('/proc/stat', 'utf8')),
    throttleCount: await readThrottleCount()
  };
}

export function getCpuStability(start, end) {
  const total = end.total - start.total;
  const stability = {
    stealPercent:
      total > 0
        ? Number((((end.steal - start.steal) / total) * 100).toFixed(2))
        : 0
  };
  // Leave the key out, the statistics log an error for undefined values
  if (start.throttleCount !== undefined && end.throttleCount !== undefined) {
    stability.throttleCount = end.throttleCount - start.throttleCount;
  }
  return stability;
}
