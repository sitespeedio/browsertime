const chrome = require('../../chrome/webdriver/');
const log = require('intel').getLogger('browsertime.edge');
const get = require('lodash.get');

module.exports.configureBuilder = function(builder, baseDir, options) {
  const edgeConfig = options.edge || {};

  let edgedriverPath = get(edgeConfig, 'edgedriverPath');
  if (!edgedriverPath) {
    const edgedriver = require('@sitespeed.io/edgedriver');
    edgedriverPath = edgedriver.binPath();
  }
  options.chrome.chromedriverPath = edgeConfig.edgedriverPath;
  log.info(
    'Using Edge is experimental at the moment and use the same configuration as for Chrome'
  );

  chrome.configureBuilder(builder, baseDir, options);
};
