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

  if (argv.chrome && argv.chrome.mobileEmulation) {
    var m = argv.chrome.mobileEmulation;
    if (!(m.deviceName || (m.height && m.width && m.pixelRatio))) {
      return 'chrome.mobileEmulation needs to specify deviceName OR height, width and pixelRatio';
    }
  }

   if (argv.video || argv.speedIndex) {
     if (!hasbin.all.sync(['ffmpeg'])) {
       return 'You need to have ffmpeg in your path to be able to record a video.'
     }
   }

    if (argv.connectivity.profile !== 'custom' && (argv.connectivity.upstreamKbps || argv.connectivity.downstreamKbps || argv.connectivity.latency)) {
      return 'You must pass --connectivity.profile "custom" for custom connectivity configs to take effect.'
    }

    if (argv.connectivity.profile === 'custom' && (!argv.connectivity.upstreamKbps || !argv.connectivity.downstreamKbps || !argv.connectivity.latency)) {
      return 'You must set downstreamKbps, upstreamKbps and latency when using --connectivity.profile "custom".'
    }

   if (argv.connectivity.profile !== 'native' && argv.connectivity.engine === 'tc') {
     if (!hasbin.all.sync(['tc'])) {
       return 'You need to have tc in your path to be able to set the connectivity.'
     }
   }

   if (argv.connectivity.profile !== 'native' && argv.connectivity.engine === 'tsproxy') {
     if (!hasbin.all.sync(['python'])) {
       return 'You need to have Python 2.7 or later in your path to be able to set the connectivity.'
     }
   }

  return true;
}

module.exports.parseCommandLine = function parseCommandLine() {
  let validated = yargs
    .env('BROWSERTIME')
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
      default: 80000,
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
      describe: 'Extra command line arguments to pass to the Chrome process (e.g. --no-sandbox). ' +
      'To add multiple arguments to Chrome, repeat --chrome.args once per argument.',
      group: 'chrome'
    })
    .option('chrome.binaryPath', {
      describe: 'Path to custom Chrome binary (e.g. Chrome Canary). ' +
      'On OS X, the path should be to the binary inside the app bundle, ' +
      'e.g. /Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary',
      group: 'chrome'
    })
    .option('chrome.chromedriverPath', {
      describe: 'Path to custom Chromedriver binary. Make sure to use a Chromedriver version that\'s compatible with ' +
      'the version of Chrome you\'re using',
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
    .option('chrome.collectTracingEvents', {
      type: 'boolean',
      describe: 'Include Tracing events in the performance log (implies chrome.collectPerfLog).',
      group: 'chrome'
    })
      // legacy naming of collectTracingEvents
    .option('chrome.dumpTraceCategoriesLog', {
      type: 'boolean',
      describe: false
    })
    .option('chrome.traceCategories', {
      describe: 'A comma separated list of Tracing event categories to include in the performance log (implies chrome.collectTracingEvents).',
      type: 'string',
      group: 'chrome'
    })
    .option('chrome.collectPerfLog', {
      type: 'boolean',
      describe: 'Collect performance log from Chrome with Page and Network events and save to disk.',
      group: 'chrome'
    })
      // legacy naming of dumpChromePerflog
    .option('experimental.dumpChromePerflog', {
      type: 'boolean',
      describe: false
    })
    .option('chrome.collectNetLog', {
      type: 'boolean',
      describe: 'Collect network log from Chrome and save to disk.',
      group: 'chrome'
    })
    .option('firefox.binaryPath', {
      describe: 'Path to custom Firefox binary (e.g. Firefox Nightly). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin',
      group: 'firefox'
    })
    .option('firefox.preference', {
      describe: 'Extra command line arguments to pass Firefox preferences by the format key:value ' +
      'To add multiple preferences, repeat --firefox.preference once per argument.',
       group: 'firefox'
    })
    .option('firefox.includeResponseBodies', {
      describe: 'Include response bodies in HAR',
      type: 'boolean',
      group: 'firefox'
    })
    .option('selenium.url', {
      describe: 'URL to a running Selenium server (e.g. to run a browser on another machine).',
      group: 'selenium'
    })
    .option('video', {
      type: 'boolean',
      describe: 'Record a video. Requires FFMpeg to be installed'
    })
    .option('videoRaw', {
      type: 'boolean',
      describe: 'Do not add timer and metrics to the video'
    })
    .option('speedIndex', {
      type: 'boolean',
      describe: 'Calculate SpeedIndex. Requires FFMpeg and python dependencies',
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
      describe: 'Supply a Javascript that decides when the browser is finished loading the page and can start to collect metrics. The Javascript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings happening after the loadEventEnd.'
    })
    .option('iterations', {
      alias: 'n',
      type: 'number',
      default: 3,
      describe: 'Number of times to test the url (restarting the browser between each test)'
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
    .option('proxy.http', {
      type: 'string',
      describe: 'Http proxy (host:port)',
      group: 'proxy'
    })
    .option('proxy.https', {
      type: 'string',
      describe: 'Https proxy (host:port)',
      group: 'proxy'
    })
    .option('connectivity.profile', {
      alias: 'c',
      default: 'native',
      choices: ['3g', '3gfast', '3gslow', '3gem', '2g', 'cable', 'native', 'custom'],
      describe: 'The connectivity profile.',
      group: 'connectivity'
    })
    .option('connectivity.downstreamKbps', {
      default: undefined,
      describe: 'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.upstreamKbps', {
      default: undefined,
      describe: 'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.latency', {
      default: undefined,
      describe: 'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.alias', {
      default: undefined,
      describe: 'Give your connectivity profile a custom name',
      group: 'connectivity'
    })
    /*
    .option('connectivity.tsproxy.port', {
      default: 1080,
      describe: 'The port used for ts proxy',
      group: 'connectivity'
    })
    */
    .option('connectivity.tc.device', {
      default: 'eth0',
      describe: 'The connectivity device. Used for engine tc.',
      group: 'connectivity'
    })
    .option('connectivity.engine', {
      default: 'external',
      choices: ['tc','external'],
      describe: 'The engine for connectivity. TC (Linux Traffic Control) needs tc work but will only setup upload and latency. Use external if you set the connectivity outside of Browsertime. The best way do to this is described in https://github.com/sitespeedio/browsertime#connectivity',
      group: 'connectivity'
    })
    .option('preScript', {
      describe: 'Selenium script(s) to run before you test your URL (use it for login, warm the cache, etc). Note that --preScript can be passed multiple times.'
    })
    .option('postScript', {
      describe: 'Selenium script(s) to run after you test your URL (use it for logout etc). Note that --postScript can be passed multiple times.',
    })
    .option('script', {
      describe: 'Add custom Javascript to run after the page has finished loading to collect metrics. If a single js file is specified, ' +
        'it will be included in the category named "custom" in the output json. Pass a folder to include all .js scripts ' +
        'in the folder, and have the folder name be the category. Note that --script can be passed multiple times.'
    })
    .option('userAgent', {
      describe: 'Override user agent'
    })
    .option('silent', {
      alias: 'q',
      type: 'count',
      describe: 'Only output info in the logs, not to the console. Enter twice to suppress summary line.'
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
      describe: 'Size of browser window WIDTHxHEIGHT or "maximize". Note that "maximize" is ignored for xvfb.'
    })
    .option('resultDir', {
      describe: 'Set result directory for the files produced by Browsertime'
    })
    .option('xvfb', {
      type: 'boolean',
      default: false,
      describe: 'Start xvfb before the browser is started'
    })
    .option('preURL', {
      describe: 'A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the cache.'
    })
    .option('userTimingWhitelist', {
      describe: 'All userTimings are captured by default this option takes a regex that will whitelist which userTimings to capture in the results.'
    })
    .count('verbose')
    .string('_')
    .help('h')
    .alias('h', 'help')
    .alias('V', 'version')
    .alias('v', 'verbose')
    .check(validateInput);

    if (process.stdout.isTTY) {
       validated.wrap(yargs.terminalWidth());
     }

    let argv = validated.argv;

  return {
    'url': argv._[0],
    'options': argv
  };
};
