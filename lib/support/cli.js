'use strict';

let yargs = require('yargs'),
  urlValidator = require('valid-url'),
  util = require('util'),
  packageInfo = require('../../package');

function validateInput(argv) {
  let url = argv._[0];
  if (!urlValidator.isWebUri(url)) {
    return util.format('\'%s\' is not a valid url (e.g. http://www.browsertime.net)', url);
  }
  if (argv.basicAuth) {
    if (!(argv.basicAuth.username && argv.basicAuth.password)) {
      return 'Basic authentication config needs to include both username and password';
    }
  }
  if (argv.chrome && argv.chrome.mobileEmulation) {
    var m = argv.chrome.mobileEmulation;
    if (!(m.deviceName || (m.height && m.width && m.pixelRatio))) {
      return 'chrome.mobileEmulation needs to specify deviceName OR height, width and pixelRatio';
    }
  }
  return true;
}

module.exports.parseCommandLine = function parseCommandLine() {
  let argv = yargs
    .usage('$0 [options] <url>')
    .require(1, 'url')
    .version(function() {
      return packageInfo.version;
    })
    .count('verbose')
    .string('o')
    .string('b')
    .boolean('prettyPrint')
    .boolean('skipHar')
    .default('delay', 0)
    .default('timeouts.browserStart', 10000)
    .default('timeouts.pageLoad', 60000)
    .default('timeouts.script', 10000)
    .default('timeouts.pageCompleteCheck', 60000)
    .default('iterations', 3)
    .default('browser','chrome')
    .boolean('experimental.nativeHar')
    .boolean('experimental.dumpChromePerflog')
    .string('userAgent')
    .string('seleniumUrl')
    .string('preTask')
    .string('postTask')
    .string('viewPort')
    .string('chrome.args')
    .string('chrome.binaryPath')
    .string('chrome.mobileEmulation.deviceName')
    .string('chrome.mobileEmulation.width')
    .string('chrome.mobileEmulation.height')
    .string('chrome.mobileEmulation.pixelRatio')
    .string('firefox.binaryPath')
    .string('pageCompleteCheck')
    .string('_')
    .boolean('silent')
    .boolean('seleniumServer')
    .help('h')
    .alias('h', 'help')
    .config('config')
    .alias('V', 'version')
    .alias('v', 'verbose')
    .alias('b', 'browser')
    .alias('n', 'iterations')
    .alias('o', 'output')
    .alias('q', 'silent')
    .describe('prettyPrint', 'Enable to print json/har with spaces and indentation. Larger files, but easier on the eye.')
    .describe('iterations', 'Number of times to test the url (restarting the browser between each test)')
    .describe('delay', 'Delay between runs, in milliseconds')
    .describe('experimental.nativeHar', 'Generate HAR file via browser dev tools/plugins, not using a proxy. [EXPERIMENTAL FEATURE]')
    .describe('browser', 'Specify browser')
    .describe('userAgent', 'Override user agent')
    .describe('basicAuth.domain', 'Domain to apply basic authentication to. If it\'s missing ' +
      'the domain is extracted from the tested url')
    .describe('basicAuth.username', 'Username for basic authentication')
    .describe('basicAuth.password', 'Password for basic authentication')
    .describe('chrome.args', 'Extra command line args to pass to the chrome process (e.g. --no-sandbox)')
    .describe('chrome.binaryPath', 'Path to custom Chrome binary (e.g. Chrome Canary). ' +
      'On OS X, the path should be to the binary inside the app bundle, ' +
      'e.g. /Applications/Google\ Chrome Canary.app/Contents/MacOS/Google Chrome Canary')
    .describe('chrome.mobileEmulation.deviceName', 'Name of device to emulate (see list in Chrome DevTools)')
    .describe('chrome.mobileEmulation.width', 'Width in pixels of emulated mobile screen (e.g. 360)')
    .describe('chrome.mobileEmulation.height', 'Height in pixels of emulated mobile screen (e.g. 640)')
    .describe('chrome.mobileEmulation.pixelRatio', 'Pixel ratio of emulated mobile screen (e.g. 2.0)')
    .describe('firefox.binaryPath', 'Path to custom Firefox binary (e.g. Firefox Nightly). ' +
      'On OS X, the path should be to the binary inside the app bundle, ' +
      'e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin')
    .describe('silent', 'Only output info in the logs, not to the console')
    .describe('output', 'Specify file name for Browsertime data. Unless specified, file will be named <domain>-<timestamp>.json')
    .describe('har', 'Specify file name for .har file. Unless specified, file will be named <domain>-<timestamp>.har')
    .describe('skipHar', 'Pass --skipHar to not collect a HAR file.')
    .describe('seleniumServer', 'Use SeleniumServer jar file to interact with browser.')
    .describe('seleniumUrl', 'URL to a running Selenium server (e.g. to run a browser on another machine).')
    .describe('config', 'Path to json config file')
    .describe('viewPort', 'Size of browser window WIDTHxHEIGHT')
    .describe('timeouts.browserStart', 'Timeout when waiting for browser to start, in milliseconds')
    .describe('timeouts.pageLoad', 'Timeout when waiting for url to load, in milliseconds')
    .describe('timeouts.script', 'Timeout when running browser scripts, in milliseconds')
    .describe('timeouts.pageCompleteCheck', 'Timeout when waiting for page to complete loading, in milliseconds')
    .describe('pageCompleteCheck', 'javascript snippet is repeatedly queried to see if page has completed loading ' +
      '(indicated by the script returning true). Default script is \'' +
      'return window.performance.timing.loadEventEnd>0' + '\'.')
    .choices('browser', ['chrome', 'firefox', 'ie'])
    .check(validateInput)
    .wrap(yargs.terminalWidth())
    .argv;

  return {
    'url': argv._[0],
    'options': argv
  };
};
