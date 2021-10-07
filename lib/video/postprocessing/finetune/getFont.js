'use strict';

const fs = require('fs');
module.exports = function (options) {
  // If the font is not part of the params and we're on macOS
  // we check that SFNSMono.ttf is available
  if (!options.videoParams.fontPath && process.platform === 'darwin') {
    const systemFontFile = '/System/Library/Fonts/SFNSMono.ttf';
    try {
      if (fs.existsSync(systemFontFile)) {
        return systemFontFile + ':';
      }
      return '';
    } catch (err) {
      return '';
    }
  } else if (!options.videoParams.fontPath && options.docker) {
    // Mono font Ubuntu 20.04
    const systemFontFile =
      '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf';
    try {
      if (fs.existsSync(systemFontFile)) {
        return systemFontFile + ':';
      }
      return '';
    } catch (err) {
      return '';
    }
  } else
    return options.videoParams.fontPath
      ? options.videoParams.fontPath + ':'
      : '';
};
