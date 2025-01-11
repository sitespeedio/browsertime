import { logging } from 'selenium-webdriver';
import { ServiceBuilder, Options } from 'selenium-webdriver/chrome.js';
import { pac, manual } from 'selenium-webdriver/proxy.js';
import { setupChromiumOptions } from './setupChromiumOptions.js';
import { pick, isEmpty, getProperty } from '../../support/util.js';

/**
 * Configure a WebDriver builder based on the specified options.
 * @param builder
 * @param {Object} options the options for a web driver.
 */
export async function configureBuilder(builder, baseDir, options) {
  const chromeConfig = options.chrome || {};

  let chromedriverPath = getProperty(chromeConfig, 'chromedriverPath');
  if (!chromedriverPath) {
    let chromedriver = await import('@sitespeed.io/chromedriver');
    chromedriverPath = chromedriver.default.binPath();
  }

  const serviceBuilder = new ServiceBuilder(chromedriverPath);

  // Remove the check that matches the Chromedriver version with Chrome version.
  serviceBuilder.addArguments('--disable-build-check');

  if (options.chrome && options.chrome.chromedriverPort) {
    serviceBuilder.setPort(options.chrome.chromedriverPort);
  }
  if (
    options.verbose >= 2 ||
    chromeConfig.enableChromeDriverLog ||
    chromeConfig.enableVerboseChromeDriverLog
  ) {
    serviceBuilder.loggingTo(`${baseDir}/chromedriver.log`);
    if (options.verbose >= 3 || chromeConfig.enableVerboseChromeDriverLog)
      serviceBuilder.enableVerboseLogging();
  }
  builder.setChromeService(serviceBuilder);

  const proxyPacSettings = pick(options.proxy, ['pac']);

  if (!isEmpty(proxyPacSettings)) {
    builder.setProxy(pac(proxyPacSettings));
  }

  const proxySettings = pick(options.proxy, ['ftp', 'http', 'https', 'bypass']);

  if (!isEmpty(proxySettings)) {
    builder.setProxy(manual(proxySettings));
  }

  let chromeOptions = new Options();
  let logPrefs = new logging.Preferences();
  logPrefs.setLevel(logging.Type.PERFORMANCE, logging.Level.ALL);

  if (chromeConfig.collectConsoleLog) {
    logPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
  }

  chromeOptions.setLoggingPrefs(logPrefs);

  builder
    .getCapabilities()
    .set('pageLoadStrategy', getProperty(options, 'pageLoadStrategy', 'normal'))
    .set('goog:loggingPrefs', logPrefs); // Fix for Chrome/Chromedriver 75

  setupChromiumOptions(chromeOptions, chromeConfig, options, baseDir);

  builder.setChromeOptions(chromeOptions);
}
