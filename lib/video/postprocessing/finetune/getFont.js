'use strict';

const log = require('intel').getLogger('browsertime.video');
const fs = require('fs');
module.exports = function(
  options
) {
  // If the font is not part of the params and we're on macOS
  // we check that SFNSText.ttf is available
  if (!options.videoParams.fontPath && process.platform === 'darwin') {
    const systemFontFile = '/System/Library/Fonts/SFNSText.ttf';
    try {
      if (fs.existsSync(systemFontFile)) {
        return systemFontFile + ':';
      }
      return '';
    } catch(err) {
      return '';
    }
  }
  return options.videoParams.fontPath ? options.videoParams.fontPath + ':' : '';
}
