const chrome = require('../../chrome/webdriver/');
const log = require('intel').getLogger('browsertime.edge');

module.exports.configureBuilder = function(builder, baseDir, options) {
  const edgeConfig = options.edge || {};
  if (!edgeConfig.edgedriverPath) {
    log.error(
      'Missing --edge.edgedriverPath configuration, Edge will not work'
    );
  } else {
    log.info(
      'Using Edge is experimental at the moment and use the same configuration as for Chrome'
    );
    options.chrome.chromedriverPath = edgeConfig.edgedriverPath;
  }
  chrome.configureBuilder(builder, baseDir, options);
};
