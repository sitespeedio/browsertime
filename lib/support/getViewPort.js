import { getLogger } from '@sitespeed.io/log';
import { isAndroidConfigured } from '../android/index.js';
import { getProperty } from '../support/util.js';
const log = getLogger('browsertime');

// Most use screen size as of 2018
// https://www.w3schools.com/browsers/browsers_display.asp
const DEFAULT_VIEWPORT = '1366x768';
// Keep numbers even to work with xvfb
const sizeMap = {
  'iPhone 5': '320x568',
  'iPhone 6': '376x668',
  'iPhone 7': '376x668',
  'iPhone 8': '376x668',
  'iPhone 6 Plus': '414x736',
  'iPhone 7 Plus': '414x736',
  'iPhone 8 Plus': '414x736',
  'iPhone X': '376x812',
  'Galaxy S5': '360x640',
  'Moto G4': '360x640',
  'Pixel 2': '412x732',
  'Pixel 2 XL': '412x824',
  iPad: '768x1024',
  'iPad Mini': '768x1024',
  'iPad Air': '820x1180',
  'iPad Pro': '1024x1366',
  'iPhone XR': '414x896',
  'iPhone SE': '377x668',
  'iPhone 12 Pro': '390x844',
  'iPhone 14 Pro': '430x932',
  'iPhone 14 Pro Max': '430x932',
  'Pixel 5': '394x852',
  'Pixel 7': '412x916',
  'Samsung Galaxy S8+': '412x846',
  'Samsung Galaxy A51/71': '412x914'
};

export function getViewPort(options) {
  // you cannot set the width/height for phone so just keep the viewport undefined
  if (isAndroidConfigured(options)) {
    return;
  }
  const emulatedWidth = getProperty(options, 'chrome.mobileEmulation.width');
  const emulatedHeight = getProperty(options, 'chrome.mobileEmulation.height');
  if (emulatedWidth && emulatedHeight) {
    return `${emulatedWidth}x${emulatedHeight}`;
  }

  const deviceName = getProperty(
    options,
    'chrome.mobileEmulation.deviceName',
    false
  );
  if (deviceName) {
    // TODO if it don't map ...
    const viewPort = sizeMap[deviceName];
    if (viewPort) {
      return viewPort;
    } else {
      log.error(
        'No matching viewPort for device %s. Will use default viewport',
        deviceName
      );
      return DEFAULT_VIEWPORT;
    }
  }

  if (
    /^\d+x\d+$/.test(options.viewPort) ||
    (options.viewPort === 'maximize' && !options.xvfb)
  ) {
    return options.viewPort;
  }

  return DEFAULT_VIEWPORT;
}
