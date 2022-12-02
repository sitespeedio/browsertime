import { isAndroidConfigured } from '../../android/index.js';
import { AndroidRecorder } from './android/recorder.js';
import { DesktopRecorder } from './desktop/desktopRecorder.js';
import { FirefoxWindowRecorder } from './firefox/firefoxWindowRecorder.js';
import { IOSSimulatorRecorder } from './iosSimulator/recorder.js';
import { IOSRecorder } from './ios/iosRecorder.js';

export function getRecorder(options, browser, baseDir) {
  if (
    options.browser === 'firefox' &&
    options.firefox &&
    options.firefox.windowRecorder
  ) {
    return new FirefoxWindowRecorder(options, browser, baseDir);
  }

  if (isAndroidConfigured(options)) {
    return new AndroidRecorder(options);
  }

  if (
    options.browser === 'safari' &&
    options.safari &&
    options.safari.useSimulator
  ) {
    return new IOSSimulatorRecorder(options, baseDir);
  }

  if (options.browser === 'safari' && options.safari && options.safari.ios) {
    return new IOSRecorder(options, baseDir);
  }

  return new DesktopRecorder(options);
}
