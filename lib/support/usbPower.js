export async function loadUsbPowerProfiler() {
  try {
    // usb-power-profiling/usb-power-profiling.js exports a default, so we destructure it
    const { default: usbPowerProfiler } = await import(
      'usb-power-profiling/usb-power-profiling.js'
    );
    return usbPowerProfiler;
  } catch {
    return;
  }
}
