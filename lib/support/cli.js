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

   if (argv.experimental && argv.experimental.video) {
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

function getOptions(opt) {
  var options = {
    'timeouts.browserStart': {
      default: 60000,
      type: 'number',
      describe: 'Timeout when waiting for browser to start, in milliseconds',
      group: 'timeouts'
    },
    'timeouts.pageLoad': {
      default: 300000,
      type: 'number',
      describe: 'Timeout when waiting for url to load, in milliseconds',
      group: 'timeouts'
    },
    'timeouts.script': {
      default: 80000,
      type: 'number',
      describe: 'Timeout when running browser scripts, in milliseconds',
      group: 'timeouts'
    },
    'timeouts.pageCompleteCheck': {
      default: 300000,
      type: 'number',
      describe: 'Timeout when waiting for page to complete loading, in milliseconds',
      group: 'timeouts'
    },
    'chrome.args': {
      describe: 'Extra command line args to pass to the chrome process (e.g. ––no-sandbox)', // note ndash '–' to prevent prefix
      group: 'chrome'
    },
    'chrome.binaryPath': {
      describe: 'Path to custom Chrome binary (e.g. Chrome Canary). ' +
      'On OS X, the path should be to the binary inside the app bundle, ' +
      'e.g. /Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary',
      group: 'chrome'
    },
    'chrome.mobileEmulation.deviceName': {
      describe: 'Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add company like \'Apple iPhone 6\')',
      group: 'chrome'
    },
    'chrome.mobileEmulation.width': {
      type: 'number',
      describe: 'Width in pixels of emulated mobile screen (e.g. 360)',
      group: 'chrome'
    },
    'chrome.mobileEmulation.height': {
      type: 'number',
      describe: 'Height in pixels of emulated mobile screen (e.g. 640)',
      group: 'chrome'
    },
    'chrome.mobileEmulation.pixelRatio': {
      describe: 'Pixel ratio of emulated mobile screen (e.g. 2.0)',
      group: 'chrome'
    },
    'chrome.android.package': {
      describe: 'Run Chrome on your Android device. Set to com.android.chrome for default Chrome version.',
      group: 'chrome'
    },
    'chrome.android.deviceSerial': {
      describe: 'Choose which device to use. If you do not set it, random device will be used.',
      group: 'chrome'
    },
    'firefox.binaryPath': {
      describe: 'Path to custom Firefox binary (e.g. Firefox Nightly). ' +
      'On OS X, the path should be to the binary inside the app bundle, ' +
      'e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin',
      group: 'firefox'
    },
    'selenium.url': {
      describe: 'URL to a running Selenium server (e.g. to run a browser on another machine).',
      group: 'selenium'
    },
    'experimental.dumpChromePerflog': {
      describe: 'Dump Chromes performance log with Network.* events to disk.',
      group: 'experimental'
    },
    'experimental.video': {
      describe: 'Record a video and collect SpeedIndex. Needs FFMPEG & Python dependencies for VisualMetrics',
      group: 'experimental'
    },
    'browser': {
      alias: 'b',
      default: 'chrome',
      choices: ['chrome', 'firefox'],
      describe: 'Specify browser'
    },
    'screenshot': {
      type: 'boolean',
      describe: 'Save one screen shot per iteration.'
    },
    'pageCompleteCheck': {
      describe: 'Javascript snippet is repeatedly queried to see if page has completed loading ' +
      '(indicated by the script returning true).'
    },
    'iterations': {
      alias: 'n',
      type: 'number',
      default: 3,
      describe: 'Number of times to test the url (restarting the browser between each test)'
    },
    'prettyPrint': {
      type: 'boolean',
      default: false,
      describe: 'Enable to print json/har with spaces and indentation. Larger files, but easier on the eye.'
    },
    'delay': {
      type: 'number',
      default: 0,
      describe: 'Delay between runs, in milliseconds'
    },
    'connectivity.profile': {
      alias: 'c',
      default: 'native',
      choices: ['3g', '3gfast', '3gslow', '2g', 'cable', 'native', 'custom'],
      describe: 'The connectivity profile. Default connectivity engine is tsproxy',
      group: 'connectivity'
    },
    'connectivity.downstreamKbps': {
      default: undefined,
      describe: 'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    },
    'connectivity.upstreamKbps': {
      default: undefined,
      describe: 'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    },
    'connectivity.latency': {
      default: undefined,
      describe: 'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    },
    'connectivity.tsproxy.port': {
      default: 1080,
      describe: 'The port used for ts proxy',
      group: 'connectivity'
    },
    'connectivity.tc.device': {
      default: 'eth0',
      describe: 'The connectivity device. Used for engine tc.',
      group: 'connectivity'
    },
    'connectivity.engine': {
      default: 'tsproxy',
      choices: ['tc', 'tsproxy'],
      describe: 'The engine for connectivity. Tsproxy needs Python 2.7. TC needs tc, modprobe and ip installed to work. Running tc inside Docker needs modprobe to run outside the container.',
      group: 'connectivity'
    },
    'preScript': {
      describe: 'Task(s) to run before you test your URL (use it for login etc). Note that --preScript can be passed multiple times.'
    },
    'postScript': {
      describe: 'Task(s) to run after you test your URL (use it for logout etc). Note that --postScript can be passed multiple times.'
    },
    'script': {
      describe: 'Add custom Javascript to run on page. If a single js file is specified, ' +
      'it will be included in the category named "custom" in the output json. Pass a folder to include all .js scripts ' +
      'in the folder, and have the folder name be the category. Note that --script can be passed multiple times.'
    },
    'userAgent': {
      describe: 'Override user agent'
    },
    'silent': {
      alias: 'q',
      type: 'count',
      describe: 'Only output info in the logs, not to the console. Enter twice to suppress summary line.'
    },
    'output': {
      alias: 'o',
      describe: 'Specify file name for Browsertime data (ex: \'browsertime\'). Unless specified, file will be named browsertime.json'
    },
    'har': {
      describe: 'Specify file name for .har file (ex: \'browsertime\'). Unless specified, file will be named browsertime.har'
    },
    'skipHar': {
      type: 'boolean',
      describe: 'Pass --skipHar to not collect a HAR file.'
    },
    'config': {
      describe: 'Path to JSON config file',
      config: 'config'
    },
    'viewPort': {
      describe: 'Size of browser window WIDTHxHEIGHT'
    },
    'resultDir': {
      describe: 'Set result directory for the files produced by Browsertime'
    },
    'statistics': {
      type: 'boolean',
      default: true,
      describe: 'Include statistics in JSON output'
    },
  };

  if (opt && opt.prefix) {
    Object.keys(options).forEach(key => {
      let val = options[key];
      let describe = val.describe || val.description || val.desc;
      if (describe) val.describe = describe.replace(/--(?=\w+)/g, t => t + opt.prefix);
      if (opt.group && (val.group || opt.forceGroup)) val.group = opt.group;
      options[opt.prefix + key] = val;
      delete options[key];
    });
  }
  return options;
}

function parseCommandLine() {
  let argv = yargs
    .usage('$0 [options] <url>')
    .require(1, 'url')
    .version(function() {
      return packageInfo.version;
    })
    .options(getOptions())
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
}

module.exports = {
  parseCommandLine: parseCommandLine,
  getOptions: getOptions
};
