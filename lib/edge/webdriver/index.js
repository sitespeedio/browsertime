const chrome = require('../../chrome/webdriver/');
const log = require('intel').getLogger('browsertime.edge');

module.exports.configureBuilder = function(builder, baseDir, options) {
  const edgeConfig = options.edge || {};
  if (!edgeConfig.edgedriverPath) {
    log.error('Missing --edge.edgedriverPath configuration');
  } else {
    options.chrome.chromedriverPath = edgeConfig.edgedriverPath;
  }
  chrome.configureBuilder(builder, baseDir, options);
};
