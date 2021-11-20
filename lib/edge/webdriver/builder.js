const edge = require('selenium-webdriver/edge');
const log = require('intel').getLogger('browsertime.edge');
const get = require('lodash.get');
const proxy = require('selenium-webdriver/proxy');
const pick = require('lodash.pick');
const isEmpty = require('lodash.isempty');
const webdriver = require('selenium-webdriver');
const setupChromiumOptions = require('../../chrome/webdriver/setupChromiumOptions');

module.exports.configureBuilder = function (builder, baseDir, options) {
  const edgeConfig = options.edge || {};
  const chromeConfig = options.chrome || {};

  let edgedriverPath = get(edgeConfig, 'edgedriverPath');
  const edgePath = get(edgeConfig, 'binaryPath');

  if (!edgedriverPath) {
    const edgedriver = require('@sitespeed.io/edgedriver');
    edgedriverPath = edgedriver.binPath();
  }

  let edgeOptions = new edge.Options();
  if (edgePath) {
    edgeOptions.setBinaryPath(edgePath);
  }

  const serviceBuilder = new edge.ServiceBuilder(edgedriverPath);

  // Remove the check that matches the Edgedriver version with Edge version.
  serviceBuilder.addArguments('--disable-build-check');

  if (
    options.verbose >= 2 ||
    chromeConfig.enableChromeDriverLog ||
    chromeConfig.enableVerboseChromeDriverLog
  ) {
    serviceBuilder.loggingTo(`${baseDir}/edgedriver.log`);
    if (options.verbose >= 3 || chromeConfig.enableVerboseChromeDriverLog)
      serviceBuilder.enableVerboseLogging();
  }
  builder.setEdgeService(serviceBuilder);

  log.info(
    'Using Edge is experimental at the moment and use the same configuration as for Chrome'
  );

  const proxyPacSettings = pick(options.proxy, ['pac']);

  if (!isEmpty(proxyPacSettings)) {
    builder.setProxy(proxy.pac(proxyPacSettings));
  }

  const proxySettings = pick(options.proxy, ['ftp', 'http', 'https', 'bypass']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(proxy.manual(proxySettings));
  }

  let logPrefs = new webdriver.logging.Preferences();
  logPrefs.setLevel(
    webdriver.logging.Type.PERFORMANCE,
    webdriver.logging.Level.ALL
  );

  if (chromeConfig.collectConsoleLog) {
    logPrefs.setLevel(
      webdriver.logging.Type.BROWSER,
      webdriver.logging.Level.ALL
    );
  }

  // edgeOptions.setLoggingPrefs(logPrefs);

  builder
    .getCapabilities()
    .set('pageLoadStrategy', get(options, 'pageLoadStrategy', 'normal'))
    .set('ms:loggingPrefs', logPrefs);

  setupChromiumOptions(edgeOptions, chromeConfig, options, baseDir);

  builder.setEdgeOptions(edgeOptions);
};
