'use strict';

const yargs = require('yargs');
const urlValidator = require('valid-url');
const util = require('util');
const hasbin = require('hasbin');
const videoDefaults = require('./video/defaults');

function validateInput(argv) {
  let url = argv._[0];
  if (!urlValidator.isWebUri(url)) {
    return util.format(
      "'%s' is not a valid url (e.g. http://www.browsertime.net)",
      url
    );
  }

  if (argv.chrome && argv.chrome.mobileEmulation) {
    const m = argv.chrome.mobileEmulation;
    if (!(m.deviceName || (m.height && m.width && m.pixelRatio))) {
      return 'chrome.mobileEmulation needs to specify deviceName OR height, width and pixelRatio';
    }
  }

  if (argv.video || argv.speedIndex) {
    if (!hasbin.all.sync(['ffmpeg'])) {
      return 'You need to have ffmpeg in your path to be able to record a video.';
    }
  }

  if (
    argv.firefox &&
    ((argv.firefox.nightly && argv.firefox.beta) ||
      (argv.firefox.nightly && argv.firefox.developer) ||
      (argv.firefox.developer && argv.firefox.beta))
  ) {
    return 'You can only run one Firefox instance at a time.';
  }

  if (
    argv.connectivity.profile !== 'custom' &&
    (argv.connectivity.upstreamKbps ||
      argv.connectivity.downstreamKbps ||
      argv.connectivity.latency)
  ) {
    return 'You must pass --connectivity.profile "custom" for custom connectivity configs to take effect.';
  }

  return true;
}

module.exports.parseCommandLine = function parseCommandLine() {
  let validated = yargs
    .env('BROWSERTIME')
    .usage('$0 [options] <url>')
    .require(1, 'url')
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
      describe:
        'Timeout when waiting for page to complete loading, in milliseconds',
      group: 'timeouts'
    })
    .option('chrome.args', {
      describe:
        'Extra command line arguments to pass to the Chrome process (e.g. --no-sandbox). ' +
        'To add multiple arguments to Chrome, repeat --chrome.args once per argument.',
      group: 'chrome'
    })
    .option('chrome.binaryPath', {
      describe:
        'Path to custom Chrome binary (e.g. Chrome Canary). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"',
      group: 'chrome'
    })
    .option('chrome.chromedriverPath', {
      describe:
        "Path to custom Chromedriver binary. Make sure to use a Chromedriver version that's compatible with " +
        "the version of Chrome you're using",
      group: 'chrome'
    })
    .option('chrome.mobileEmulation.deviceName', {
      describe:
        "Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add phone like 'iPhone 6')",
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
      describe:
        'Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to run adb start-server before you start.',
      group: 'chrome'
    })
    .option('chrome.android.deviceSerial', {
      describe:
        'Choose which device to use. If you do not set it, first device will be used.',
      group: 'chrome'
    })
    .option('chrome.collectTracingEvents', {
      type: 'boolean',
      describe:
        'Include Tracing events in the performance log (implies chrome.collectPerfLog).',
      group: 'chrome'
    })
    // legacy naming of collectTracingEvents
    .option('chrome.dumpTraceCategoriesLog', {
      type: 'boolean',
      describe: false
    })
    .option('chrome.traceCategories', {
      describe:
        'A comma separated list of Tracing event categories to include in the performance log (implies chrome.collectTracingEvents).',
      type: 'string',
      group: 'chrome'
    })
    .option('chrome.collectPerfLog', {
      type: 'boolean',
      describe:
        'Collect performance log from Chrome with Page and Network events and save to disk.',
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
      describe:
        'Path to custom Firefox binary (e.g. Firefox Nightly). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin',
      group: 'firefox'
    })
    .option('firefox.nightly', {
      describe:
        'Use Firefox Nightly. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.beta', {
      describe:
        'Use Firefox Beta. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.developer', {
      describe:
        'Use Firefox Developer. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.preference', {
      describe:
        'Extra command line arguments to pass Firefox preferences by the format key:value ' +
        'To add multiple preferences, repeat --firefox.preference once per argument.',
      group: 'firefox'
    })
    .option('firefox.includeResponseBodies', {
      describe: 'Include response bodies in HAR',
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.acceptInsecureCerts', {
      describe: 'Accept insecure certs',
      type: 'boolean',
      group: 'firefox'
    })
    .option('selenium.url', {
      describe:
        'URL to a running Selenium server (e.g. to run a browser on another machine).',
      group: 'selenium'
    })
    .option('video', {
      type: 'boolean',
      describe:
        'Record a video and store the video. Set it to false to remove the video that is created by turning on speedIndex. Requires FFMpeg to be installed.'
    })
    .option('videoParams.framerate', {
      default: videoDefaults.framerate,
      describe: 'Frames per second',
      group: 'video'
    })
    .option('videoParams.crf', {
      default: videoDefaults.crf,
      describe:
        'Constant rate factor see https://trac.ffmpeg.org/wiki/Encode/H.264#crf',
      group: 'video'
    })
    .option('videoParams.addTimer', {
      type: 'boolean',
      default: videoDefaults.addTimer,
      describe: 'Add timer and metrics to the video.',
      group: 'video'
    })
    .option('videoParams.keepOriginalVideo', {
      type: 'boolean',
      default: false,
      describe: false,
      group: 'video'
    })
    .option('videoParams.filmstripFullSize', {
      type: 'boolean',
      default: false,
      describe:
        'Keep original sized screenshots. Will make the run take longer time',
      group: 'video'
    })
    .option('videoParams.filmstripQuality', {
      default: 75,
      describe: 'The quality of the filmstrip screenshots. 0-100.',
      group: 'video'
    })
    .option('videoParams.createFilmstrip', {
      type: 'boolean',
      default: true,
      describe: 'Create filmstrip screenshots.',
      group: 'video'
    })
    .option('videoParams.combine', {
      type: 'boolean',
      default: false,
      describe:
        'Combine preScript/postScript with the tested URL in the video. Turn this on and you will record the all scripts.',
      group: 'video'
    })
    // legacy of video.notext
    .option('videoRaw', {
      type: 'boolean',
      describe: false
    })
    .option('speedIndex', {
      type: 'boolean',
      describe: 'Calculate SpeedIndex. Requires FFMpeg and python dependencies'
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
      describe:
        'Supply a Javascript that decides when the browser is finished loading the page and can start to collect metrics. The Javascript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings happening after the loadEventEnd.'
    })
    .option('iterations', {
      alias: 'n',
      type: 'number',
      default: 3,
      describe:
        'Number of times to test the url (restarting the browser between each test)'
    })
    .option('prettyPrint', {
      type: 'boolean',
      default: false,
      describe:
        'Enable to print json/har with spaces and indentation. Larger files, but easier on the eye.'
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
      choices: [
        '3g',
        '3gfast',
        '3gslow',
        '3gem',
        '2g',
        'cable',
        'native',
        'custom'
      ],
      describe: 'The connectivity profile.',
      group: 'connectivity'
    })
    .option('connectivity.downstreamKbps', {
      default: undefined,
      describe:
        'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.upstreamKbps', {
      default: undefined,
      describe:
        'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.latency', {
      default: undefined,
      describe:
        'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.alias', {
      default: undefined,
      describe: 'Give your connectivity profile a custom name',
      group: 'connectivity'
    })
    .option('connectivity.engine', {
      default: 'external',
      choices: ['external', 'throttle'],
      describe:
        'The engine for connectivity. Throttle works on Mac and tc based Linux (it is experimental so please use with care). Use external if you set the connectivity outside of Browsertime. The best way do to this is described in https://github.com/sitespeedio/browsertime#connectivity',
      group: 'connectivity'
    })
    .option('connectivity.throttle.localhost', {
      default: false,
      type: 'boolean',
      describe:
        'Add latency/delay on localhost. Perfect for testing with WebPageReplay',
      group: 'connectivity'
    })
    .option('requestheader', {
      alias: 'r',
      describe:
        'Request header that will be added to the request. Add multiple instances to add multiple request headers.'
    })
    .option('block', {
      describe:
        'Domain to block. Add multiple instances to add multiple domains that will be blocked.'
    })
    .option('cacheClearRaw', {
      describe:
        'Use internal browser functionality to clear browser cache between runs instead of only using Selenium.',
      type: 'boolean',
      default: false
    })
    .option('basicAuth', {
      describe:
        'Use it if your server is behind Basic Auth. Format: username@password (Only Chrome at the moment).'
    })
    .option('preScript', {
      describe:
        'Selenium script(s) to run before you test your URL (use it for login, warm the cache, etc). Note that --preScript can be passed multiple times.'
    })
    .option('postScript', {
      describe:
        'Selenium script(s) to run after you test your URL (use it for logout etc). Note that --postScript can be passed multiple times.'
    })
    .option('script', {
      describe:
        'Add custom Javascript to run after the page has finished loading to collect metrics. If a single js file is specified, ' +
        'it will be included in the category named "custom" in the output json. Pass a folder to include all .js scripts ' +
        'in the folder, and have the folder name be the category. Note that --script can be passed multiple times.'
    })
    .option('userAgent', {
      describe: 'Override user agent'
    })
    .option('silent', {
      alias: 'q',
      type: 'count',
      describe:
        'Only output info in the logs, not to the console. Enter twice to suppress summary line.'
    })
    .option('output', {
      alias: 'o',
      describe:
        "Specify file name for Browsertime data (ex: 'browsertime'). Unless specified, file will be named browsertime.json"
    })
    .option('har', {
      describe:
        "Specify file name for .har file (ex: 'browsertime'). Unless specified, file will be named browsertime.har"
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
      describe:
        'Size of browser window WIDTHxHEIGHT or "maximize". Note that "maximize" is ignored for xvfb.'
    })
    .option('resultDir', {
      describe: 'Set result directory for the files produced by Browsertime'
    })
    .option('xvfb', {
      type: 'boolean',
      default: false,
      describe: 'Start xvfb before the browser is started'
    })
    .option('xvfbParams.display', {
      default: videoDefaults.xvfbDisplay,
      describe: 'The display used for xvfb'
    })
    .option('preURL', {
      describe:
        'A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the cache.'
    })
    .option('preURLDelay', {
      describe:
        'Delay between preURL and the URL you want to test (in milliseconds)',
      type: 'integer',
      default: 1500
    })
    .option('userTimingWhitelist', {
      describe:
        'All userTimings are captured by default this option takes a regex that will whitelist which userTimings to capture in the results.'
    })
    .option('headless', {
      type: 'boolean',
      default: false,
      describe:
        'Run the browser in headless mode. Needs Firefox Nightly or latest Chrome.'
    })
    .count('verbose')
    .string('_')
    .help('h')
    .alias('h', 'help')
    .alias('V', 'version')
    .alias('v', 'verbose')
    .check(validateInput);

  validated.wrap(yargs.terminalWidth());

  let argv = validated.argv;

  if (
    argv.firefox &&
    (argv.firefox.nightly || argv.firefox.beta || argv.firefox.developer)
  ) {
    argv.browser = 'firefox';
  }

  return {
    url: argv._[0],
    options: argv
  };
};
