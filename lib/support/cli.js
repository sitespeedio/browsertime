'use strict';

let yargs = require('yargs'),
  urlValidator = require('valid-url'),
  util = require('util'),
  hasbin = require('hasbin'),
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

   if (argv.experimental && argv.experimental.video) {
     if (!hasbin.all.sync(['ffmpeg'])) {
       return 'You need to have ffmpeg in your path to be able to record a video.'
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
    .option('timeouts.browserStart', {
      default: 60000,
      type: 'number',
      describe: 'Timeout when waiting for browser to start, in milliseconds',
      group: 'timeouts'
    })
    .option('timeouts.pageLoad', {
      default: 300000,
      type: 'number',
      describe: 'Timeout when waiting for url to load, in milliseconds',
      group: 'timeouts'
    })
    .option('timeouts.script', {
      default: 40000,
      type: 'number',
      describe: 'Timeout when running browser scripts, in milliseconds',
      group: 'timeouts'
    })
    .option('timeouts.pageCompleteCheck', {
      default: 300000,
      type: 'number',
      describe: 'Timeout when waiting for page to complete loading, in milliseconds',
      group: 'timeouts'
    })
    .option('chrome.args', {
      describe: 'Extra command line args to pass to the chrome process (e.g. --no-sandbox)',
      group: 'chrome'
    })
    .option('chrome.binaryPath', {
      describe: 'Path to custom Chrome binary (e.g. Chrome Canary). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. /Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary',
      group: 'chrome'
    })
    .option('chrome.mobileEmulation.deviceName', {
      describe: 'Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add company like \'Apple iPhone 6\')',
      group: 'chrome'
    })
    .option('chrome.mobileEmulation.width', {
      type: 'number',
      describe: 'Width in pixels of emulated mobile screen (e.g. 360)',
      group: 'chrome'
    })
    .option('chrome.mobileEmulation.height', {
      type: 'number',
      describe: 'Height in pixels of emulated mobile screen (e.g. 640)',
      group: 'chrome'
    })
    .option('chrome.mobileEmulation.pixelRatio', {
      describe: 'Pixel ratio of emulated mobile screen (e.g. 2.0)',
      group: 'chrome'
    })
    .option('chrome.android.package', {
      describe: 'Run Chrome on your Android device. Set to com.android.chrome for default Chrome version.',
      group: 'chrome'
    })
    .option('chrome.android.deviceSerial', {
      describe: 'Choose which device to use. If you do not set it, random device will be used.',
      group: 'chrome'
    })
    .option('firefox.binaryPath', {
      describe: 'Path to custom Firefox binary (e.g. Firefox Nightly). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin',
      group: 'firefox'
    })
    .option('selenium.url', {
      describe: 'URL to a running Selenium server (e.g. to run a browser on another machine).',
      group: 'selenium'
    })
    .option('basicAuth.domain', {
      describe: 'Domain to apply basic authentication to. If it\'s missing ' +
        'the domain is extracted from the tested url',
      group: 'basicAuth'
    })
    .option('basicAuth.username', {
      describe: 'Username for basic authentication',
      group: 'basicAuth'
    })
    .option('basicAuth.password', {
      describe: 'Password for basic authentication',
      group: 'basicAuth'
    })
    .option('experimental.dumpChromePerflog', {
      describe: 'Dump Chromes performance log with Network.* events to disk.',
      group: 'experimental'
    })
    .option('experimental.video', {
      describe: 'Record a video and collect SpeedIndex. Needs FFMPEG & Python dependencies for VisualMetrics',
      group: 'experimental'
    })
    .option('browser', {
      alias: 'b',
      default: 'chrome',
      choices: ['chrome', 'firefox'],
      describe: 'Specify browser'
    })
    .option('screenshot', {
      type: 'boolean',
      describe: 'Save one screen shot per iteration.'
    })
    .option('pageCompleteCheck', {
      describe: 'Javascript snippet is repeatedly queried to see if page has completed loading ' +
        '(indicated by the script returning true). Default script is \'' +
        'return window.performance.timing.loadEventEnd>0' + '\'.'
    })
    .option('iterations', {
      alias: 'n',
      type: 'number',
      default: 3,
      describe: 'Number of times to test the url (restarting the browser between each test)'
    })
    .option('statistics', {
      type: 'boolean',
      default: true,
      describe: 'Include statistics in JSON output'
    })
    .option('prettyPrint', {
      type: 'boolean',
      default: false,
      describe: 'Enable to print json/har with spaces and indentation. Larger files, but easier on the eye.'
    })
    .option('delay', {
      type: 'number',
      default: 0,
      describe: 'Delay between runs, in milliseconds'
    })
    .option('preTask', {
      describe: 'Task(s) to run before you test your URL (use it for login etc). Note that --preTask can be passed multiple times.'
    })
    .option('postTask', {
      describe: 'Task(s) to run after you test your URL (use it for logout etc). Note that --postTask can be passed multiple times.'
    })
    .option('script', {
      describe: 'Add custom Javascript to run on page. If a single js file is specified, ' +
        'it will be included in the category named "custom" in the output json. Pass a folder to include all .js scripts ' +
        'in the folder, and have the folder name be the category. Note that --script can be passed multiple times.'
    })
    .option('userAgent', {
      describe: 'Override user agent'
    })
    .option('silent', {
      alias: 'q',
      type: 'boolean',
      describe: 'Only output info in the logs, not to the console'
    })
    .option('output', {
      alias: 'o',
      describe: 'Specify file name for Browsertime data (ex: \'browsertime\'). Unless specified, file will be named browsertime.json'
    })
    .option('har', {
      describe: 'Specify file name for .har file (ex: \'browsertime\'). Unless specified, file will be named browsertime.har'
    })
    .option('skipHar', {
      type: 'boolean',
      describe: 'Pass --skipHar to not collect a HAR file.'
    })
    .option('config', {
      describe: 'Path to JSON config file',
      config: 'config'
    })
    .option('viewPort', {
      describe: 'Size of browser window WIDTHxHEIGHT'
    })
    .option('proxy', {
      type: 'boolean',
      default: false,
      describe: 'Use BrowserMobProxy as a proxy to be able to use basicAuth and trafficShapping (but nut H/2)'
    })
    .option('resultDir', {
      describe: 'Set result directory for the files produced by Browsertime'
    })
    .count('verbose')
    .string('_')
    .help('h')
    .alias('h', 'help')
    .alias('V', 'version')
    .alias('v', 'verbose')
    .check(validateInput)
    .wrap(yargs.terminalWidth())
    .argv;

  return {
    'url': argv._[0],
    'options': argv
  };
};
