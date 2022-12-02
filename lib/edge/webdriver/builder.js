import { Options, ServiceBuilder } from 'selenium-webdriver/edge.js';
import intel from 'intel';
import get from 'lodash.get';
import pick from 'lodash.pick';
import isEmpty from 'lodash.isempty';
import { logging } from 'selenium-webdriver';
import { setupChromiumOptions } from '../../chrome/webdriver/setupChromiumOptions.js';
const log = intel.getLogger('browsertime.edge');
const { pac, manual } = 'selenium-webdriver/proxy.js';

export async function configureBuilder(builder, baseDir, options) {
  const edgeConfig = options.edge || {};
  const chromeConfig = options.chrome || {};

  let edgedriverPath = get(edgeConfig, 'edgedriverPath');
  const edgePath = get(edgeConfig, 'binaryPath');

  if (!edgedriverPath) {
    const edgedriver = await import('@sitespeed.io/edgedriver');
    edgedriverPath = edgedriver.default.binPath();
  }

  let edgeOptions = new Options();
  if (edgePath) {
    edgeOptions.setBinaryPath(edgePath);
  }

  const serviceBuilder = new ServiceBuilder(edgedriverPath);

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
    builder.setProxy(pac(proxyPacSettings));
  }

  const proxySettings = pick(options.proxy, ['ftp', 'http', 'https', 'bypass']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(manual(proxySettings));
  }

  let logPrefs = new logging.Preferences();
  logPrefs.setLevel(logging.Type.PERFORMANCE, logging.Level.ALL);

  if (chromeConfig.collectConsoleLog) {
    logPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
  }

  // edgeOptions.setLoggingPrefs(logPrefs);

  builder
    .getCapabilities()
    .set('pageLoadStrategy', get(options, 'pageLoadStrategy', 'normal'))
    .set('ms:loggingPrefs', logPrefs);

  setupChromiumOptions(edgeOptions, chromeConfig, options, baseDir);

  builder.setEdgeOptions(edgeOptions);
}
