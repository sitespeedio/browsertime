import { format } from 'node:util';
import { readFileSync, statSync } from 'node:fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  framerate,
  crf,
  addTimer,
  threads,
  xvfbDisplay
} from '../video/defaults.js';
import { screenshotDefaults } from '../screenshot/defaults.js';
import { geckoProfilerDefaults } from '../firefox/settings/geckoProfilerDefaults.js';
import { findUpSync } from './fileUtil.js';
import { setProperty, getProperty } from './util.js';
import { execaSync } from 'execa';

const configPath = findUpSync(['.browsertime.json']);

let config;
try {
  config = configPath ? JSON.parse(readFileSync(configPath)) : {};
} catch (error) {
  if (error instanceof SyntaxError) {
    /* eslint no-console: off */
    console.error(
      'Could not parse the config JSON file ' +
        configPath +
        '. Is the file really valid JSON?'
    );
  }
  throw error;
}

function hasbin(bin) {
  try {
    const cmd = process.platform === 'win32' ? 'where' : 'which';
    execaSync(cmd, bin);
    return true;
  } catch {
    return false;
  }
}

function validateInput(argv) {
  // Check NodeJS major version
  const fullVersion = process.versions.node;
  const minVersion = 14;
  const majorVersion = fullVersion.split('.')[0];
  if (majorVersion < minVersion) {
    return (
      'You need to have at least NodeJS version ' +
      minVersion +
      ' to run Browsertime. You are using version ' +
      fullVersion
    );
  }

  // validate URLs/files
  const urlOrFiles = argv._;
  for (let urlOrFile of urlOrFiles) {
    if (!urlOrFile.startsWith('http')) {
      // is existing file?
      try {
        statSync(urlOrFile);
      } catch {
        return format(
          "'%s' does not exist, is the path to the file correct?",
          urlOrFile
        );
      }
    }
  }

  if (argv.chrome && argv.chrome.mobileEmulation) {
    const m = argv.chrome.mobileEmulation;
    if (!(m.deviceName || (m.height && m.width && m.pixelRatio))) {
      return 'chrome.mobileEmulation needs to specify deviceName OR height, width and pixelRatio';
    }
  }

  if ((argv.video || argv.visualMetrics) && !hasbin(['ffmpeg'])) {
    return 'You need to have ffmpeg in your path to be able to record a video.';
  }

  if (argv.safari && argv.safari.useSimulator && !argv.safari.deviceUDID) {
    return 'You need to specify the --safari.deviceUDID when you run the simulator.';
  }

  if (argv.debug && argv.browser === 'safari') {
    return 'Debug mode do not work in Safari. Please try with Firefox/Chrome or Edge';
  }

  if (argv.debug && argv.android.enabled) {
    return 'Debug mode do not work on Android. Please run debug mode on Desktop.';
  }

  if (argv.debug && argv.docker) {
    return 'There is no benefit running debug mode inside a Docker container.';
  }

  if (argv.tcpdump && !hasbin(['tcpdump'])) {
    return 'You need to have tcpdump in your path to be able to record a tcpdump.';
  }

  if (argv.gnirehtet && !hasbin(['gnirehtet'])) {
    return 'You need to have gnirehtet in your path to be able to use it. If you run on a Mac you can install it using Homebrew: brew install gnirehtet';
  }

  if (
    argv.connectivity &&
    argv.connectivity.engine === 'humble' &&
    (!argv.connectivity.humble || !argv.connectivity.humble.url)
  ) {
    return 'You need to specify the URL to Humble by using the --connectivity.humble.url option.';
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

  if (Array.isArray(argv.iterations)) {
    return 'Ooops you passed number of iterations twice, remove one of them and try again.';
  }

  if (argv.urlAlias) {
    if (!Array.isArray(argv.urlAlias)) argv.urlAlias = [argv.urlAlias];
    if (argv._.length !== argv.urlAlias.length) {
      return `Mismatch between number of URLs (${argv._.length}) and alias (${argv.urlAlias.length}). You need to provide the same amount of alias as URLs.`;
    }
  }

  return true;
}

export function parseCommandLine() {
  let argvFix = process.argv.map(arg =>
    arg === '--android' ? '--android.enabled' : arg
  );

  let yargsInstance = yargs(hideBin(argvFix));
  let validated = yargsInstance
    .parserConfiguration({
      'camel-case-expansion': false,
      'deep-merge-config': true
    })
    .env('BROWSERTIME')
    .usage('$0 [options] <url>/<scriptFile>')
    .require(1, 'One or more url or script files')
    .option('timeouts.browserStart', {
      default: 60_000,
      type: 'number',
      describe: 'Timeout when waiting for browser to start, in milliseconds',
      group: 'timeouts'
    })
    .option('timeouts.pageLoad', {
      default: 300_000,
      type: 'number',
      describe: 'Timeout when waiting for url to load, in milliseconds',
      group: 'timeouts'
    })
    .option('timeouts.script', {
      default: 120_000,
      type: 'number',
      describe: 'Timeout when running browser scripts, in milliseconds',
      group: 'timeouts'
    })
    .option('timeouts.pageCompleteCheck', {
      alias: 'maxLoadTime',
      default: 120_000,
      type: 'number',
      describe:
        'Timeout when waiting for page to complete loading, in milliseconds',
      group: 'timeouts'
    })
    .option('timeouts.networkIdle', {
      default: 5000,
      type: 'number',
      describe:
        'Timeout when running pageCompleteCheckNetworkIdle, in milliseconds',
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
        "Path to custom ChromeDriver binary. Make sure to use a ChromeDriver version that's compatible with " +
        "the version of Chrome you're using",
      group: 'chrome'
    })
    .option('chrome.chromedriverPort', {
      type: 'number',
      describe: 'Specify "--port" args for chromedriver prcocess',
      group: 'chrome'
    })
    .option('chrome.mobileEmulation.deviceName', {
      describe:
        "Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add phone like 'iPhone 6'). This will override your userAgent string.",
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
        'Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to have adb installed to make this work.',
      group: 'chrome'
    })
    .option('chrome.android.activity', {
      describe: 'Name of the Activity hosting the WebView.',
      group: 'chrome'
    })
    .option('chrome.android.process', {
      describe:
        'Process name of the Activity hosting the WebView. If not given, the process name is assumed to be the same as chrome.android.package.',
      group: 'chrome'
    })
    .option('chrome.android.deviceSerial', {
      describe:
        'Choose which device to use. If you do not set it, first device will be used.',
      group: 'chrome'
    })
    .option('chrome.traceCategories', {
      describe:
        'A comma separated list of Tracing event categories to include in the Trace log. Default no trace categories is collected.',
      type: 'string',
      group: 'chrome'
    })
    .option('chrome.traceCategory', {
      describe:
        'Add a trace category to the default ones. Use --chrome.traceCategory multiple times if you want to add multiple categories. Example: --chrome.traceCategory disabled-by-default-v8.cpu_profiler',
      type: 'string',
      group: 'chrome'
    })
    .option('chrome.enableTraceScreenshots', {
      alias: 'enableTraceScreenshots',
      describe:
        'Include screenshots in the trace log (enabling the trace category disabled-by-default-devtools.screenshot).',
      type: 'boolean',
      group: 'chrome'
    })
    .option('chrome.enableChromeDriverLog', {
      describe: 'Log Chromedriver communication to a log file.',
      type: 'boolean',
      group: 'chrome'
    })
    .option('chrome.enableVerboseChromeDriverLog', {
      describe: 'Log verboose Chromedriver communication to a log file.',
      type: 'boolean',
      group: 'chrome'
    })
    .option('chrome.enableVideoAutoplay', {
      describe: 'Allow videos to autoplay.',
      type: 'boolean',
      group: 'chrome'
    })
    .option('chrome.timeline', {
      alias: 'chrome.trace',
      describe:
        'Collect the timeline data. Drag and drop the JSON in your Chrome detvools timeline panel or check out the CPU metrics in the Browsertime.json',
      type: 'boolean',
      group: 'chrome'
    })
    .option('chrome.timelineExtras', {
      describe:
        'If you collect the timeline using --chrome.timeline or --enableProfileRun this will add some extra timings and tracks to your timeline.',
      type: 'boolean',
      default: true,
      group: 'chrome'
    })
    .option('chrome.timelineRecordingType', {
      alias: 'chrome.traceRecordingType',
      describe: 'Expose the start/stop commands for the chrome trace',
      default: 'pageload',
      choices: ['pageload', 'custom'],
      type: 'string',
      group: 'chrome'
    })
    .option('chrome.collectPerfLog', {
      type: 'boolean',
      describe:
        'Collect performance log from Chrome with Page and Network events and save to disk.',
      group: 'chrome'
    })
    .option('chrome.collectNetLog', {
      type: 'boolean',
      describe: 'Collect network log from Chrome and save to disk.',
      group: 'chrome'
    })
    .option('chrome.netLogCaptureMode', {
      default: 'IncludeSensitive',
      choices: ['Default', 'IncludeSensitive', 'Everything'],
      describe: 'Choose capture mode for Chromes netlog.',
      group: 'chrome'
    })
    .option('chrome.collectConsoleLog', {
      type: 'boolean',
      describe: 'Collect Chromes console log and save to disk.',
      group: 'chrome'
    })
    .option('chrome.appendToUserAgent', {
      type: 'string',
      describe: 'Append to the user agent.',
      group: 'chrome'
    })
    .option('chrome.noDefaultOptions', {
      type: 'boolean',
      describe:
        'Prevent Browsertime from setting its default options for Chrome',
      group: 'chrome'
    })
    .option('chrome.cleanUserDataDir', {
      type: 'boolean',
      describe:
        'If you use --user-data-dir as an argument to Chrome and want to clean that directory between each iteration you should use --chrome.cleanUserDataDir true.',
      group: 'chrome'
    })
    .option('cpu', {
      type: 'boolean',
      describe:
        'Easy way to enable both chrome.timeline for Chrome and geckoProfile for Firefox'
    })
    .option('android.powerTesting', {
      alias: 'androidPower',
      type: 'boolean',
      describe:
        'Enables android power testing - charging must be disabled for this.' +
        '(You have to disable charging yourself for this - it depends on the phone model).',
      group: 'android'
    })
    .option('android.usbPowerTesting', {
      alias: 'androidUsbPower',
      type: 'boolean',
      describe:
        'Enables android power testing using usb-power-profiling. Assumes that ' +
        'a valid device is attached to the phone. See here for supported devices: ' +
        'https://github.com/fqueze/usb-power-profiling?tab=readme-ov-file#supported-devices',
      group: 'android'
    })
    .option('chrome.CPUThrottlingRate', {
      type: 'number',
      describe:
        'Enables CPU throttling to emulate slow CPUs. Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc)',
      group: 'chrome'
    })
    .option('chrome.includeResponseBodies', {
      describe: 'Include response bodies in the HAR file.',
      default: 'none',
      choices: ['none', 'all', 'html'],
      group: 'chrome'
    })
    .option('chrome.cdp.performance', {
      type: 'boolean',
      default: true,
      describe:
        'Collect Chrome perfromance metrics from Chrome DevTools Protocol',
      group: 'chrome'
    })
    .option('chrome.blockDomainsExcept', {
      alias: 'blockDomainsExcept',
      describe:
        'Block all domains except this domain. Use it multiple time to keep multiple domains. You can also wildcard domains like *.sitespeed.io. Use this when you wanna block out all third parties.',
      group: 'chrome'
    })
    .option('chrome.ignoreCertificateErrors', {
      type: 'boolean',
      default: true,
      describe: 'Make Chrome ignore certificate errors.  Defaults to true.',
      group: 'chrome'
    })
    .option('firefox.binaryPath', {
      describe:
        'Path to custom Firefox binary (e.g. Firefox Nightly). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin',
      group: 'firefox'
    })
    .option('firefox.geckodriverPath', {
      describe:
        "Path to custom geckodriver binary. Make sure to use a geckodriver version that's compatible with " +
        "the version of Firefox (Gecko) you're using",
      group: 'firefox'
    })
    .option('firefox.geckodriverArgs', {
      describe:
        'Flags passed in to Geckodriver see https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html. Use it like --firefox.geckodriverArgs="--marionette-port"  --firefox.geckodriverArgs=1027 ',
      type: 'string',
      group: 'firefox'
    })

    .option('firefox.appendToUserAgent', {
      type: 'string',
      describe: 'Append to the user agent.',
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
    .option('firefox.args', {
      describe:
        'Extra command line arguments to pass to the Firefox process (e.g. --MOZ_LOG). ' +
        'To add multiple arguments to Firefox, repeat --firefox.args once per argument.',
      group: 'firefox'
    })
    /* -- Remove from the help until we have the new Geckodriver > 0.26
    .option('firefox.env', {
      describe:
        'Extra environment variables to set in the format name=value. ' +
        'To add multiple environment variables, repeat --firefox.env once per environment variable.',
      group: 'firefox'
    })
    */
    .option('firefox.includeResponseBodies', {
      describe: 'Include response bodies in HAR',
      default: 'none',
      choices: ['none', 'all', 'html'],
      group: 'firefox'
    })
    .option('firefox.appconstants', {
      describe: 'Include Firefox AppConstants information in the results',
      default: false,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.acceptInsecureCerts', {
      describe: 'Accept insecure certs',
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.windowRecorder', {
      describe:
        'Use the internal compositor-based Firefox window recorder to emit PNG files for each ' +
        'frame that is a meaningful change.  The PNG output will further be merged into a ' +
        'variable frame rate video for analysis. Use this instead of ffmpeg to record a video (you still need the --video flag).',
      default: false,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.memoryReport', {
      describe: 'Measure firefox resident memory after each iteration.',
      default: false,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.memoryReportParams.minizeFirst', {
      describe:
        'Force a collection before dumping and measuring the memory report.',
      default: false,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.geckoProfiler', {
      describe: 'Collect a profile using the internal gecko profiler',
      default: false,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.geckoProfilerRecordingType', {
      describe: 'Expose the start/stop commands for the gecko profiler',
      default: 'pageload',
      choices: ['pageload', 'custom'],
      type: 'string',
      group: 'firefox'
    })
    .option('firefox.geckoProfilerParams.features', {
      describe: 'Enabled features during gecko profiling',
      default: geckoProfilerDefaults.features,
      type: 'string',
      group: 'firefox'
    })
    .option('firefox.geckoProfilerParams.threads', {
      describe: 'Threads to profile.',
      default: geckoProfilerDefaults.threads,
      type: 'string',
      group: 'firefox'
    })
    .option('firefox.geckoProfilerParams.interval', {
      describe: `Sampling interval in ms.  Defaults to ${geckoProfilerDefaults.desktopSamplingInterval} on desktop, and ${geckoProfilerDefaults.androidSamplingInterval} on android.`,
      type: 'number',
      group: 'firefox'
    })
    .option('firefox.geckoProfilerParams.bufferSize', {
      describe: 'Buffer size in elements. Default is ~90MB.',
      default: geckoProfilerDefaults.bufferSize,
      type: 'number',
      group: 'firefox'
    })
    .option('firefox.perfStats', {
      describe:
        'Collect gecko performance statistics as measured internally by the firefox browser. See https://searchfox.org/mozilla-central/source/tools/performance/PerfStats.h#24-33',
      default: false,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.perfStatsParams.mask', {
      describe: 'Mask to decide which features to enable',
      // eslint-disable-next-line prettier/prettier
      default: 0xFF_FF_FF_FF,
      type: 'number',
      group: 'firefox'
    })
    .option('firefox.collectMozLog', {
      type: 'boolean',
      describe:
        'Collect the MOZ HTTP log (by default). See --firefox.setMozLog if you ' +
        'need to specify the logs you wish to gather.',
      group: 'firefox'
    })
    .option('firefox.powerConsumption', {
      type: 'boolean',
      default: false,
      describe:
        'Enable power consumption collection (in Wh). To get the consumption you also need to set firefox.geckoProfilerParams.features to include power.',
      group: 'firefox'
    })
    .option('firefox.setMozLog', {
      describe:
        'Use in conjunction with firefox.collectMozLog to set MOZ_LOG to something ' +
        'specific. Without this, the HTTP logs will be collected by default',
      default:
        'timestamp,nsHttp:5,cache2:5,nsSocketTransport:5,nsHostResolver:5',
      group: 'firefox'
    })
    .option('firefox.noDefaultPrefs', {
      describe: 'Prevents browsertime from setting its default preferences.',
      default: false,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.disableSafeBrowsing', {
      describe: 'Disable safebrowsing.',
      default: true,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.disableTrackingProtection', {
      describe: 'Disable Tracking Protection.',
      default: true,
      type: 'boolean',
      group: 'firefox'
    })
    .option('firefox.android.package', {
      describe:
        'Run Firefox or a GeckoView-consuming App on your Android device. Set to org.mozilla.geckoview_example for default Firefox version. You need to have adb installed to make this work.',
      group: 'firefox'
    })
    .option('firefox.android.activity', {
      describe: 'Name of the Activity hosting the GeckoView.',
      group: 'firefox'
    })
    .option('firefox.android.deviceSerial', {
      describe:
        'Choose which device to use. If you do not set it, first device will be used.',
      group: 'firefox'
    })
    .option('firefox.android.intentArgument', {
      describe:
        'Configure how the Android intent is launched.  Passed through to `adb shell am start ...`; ' +
        'follow the format at https://developer.android.com/studio/command-line/adb#IntentSpec. ' +
        'To add multiple arguments, repeat --firefox.android.intentArgument once per argument.',
      group: 'firefox'
    })
    .option('firefox.profileTemplate', {
      describe:
        'Profile template directory that will be cloned and used as the base of each profile each instance of Firefox is launched against.  Use this to pre-populate databases with certificates, tracking protection lists, etc.',
      group: 'firefox'
    })
    .option('selenium.url', {
      describe:
        'URL to a running Selenium server (e.g. to run a browser on another machine).',
      group: 'selenium'
    })
    .option('enableProfileRun', {
      type: 'boolean',
      describe:
        'Make one extra run that collects the profiling trace log (no other metrics is collected). For Chrome it will collect the timeline trace, for Firefox it will get the Geckoprofiler trace. This means you do not need to get the trace for all runs and can skip the overhead it produces.'
    })
    .option('enableVideoRun', {
      type: 'boolean',
      describe:
        'Make one extra run that collects video and visual metrics. This means you can do your runs with --visualMetrics true --video false --enableVideoRun true to collect visual metrics from all runs and save a video from the profile/video run. If you run it together with --enableProfileRun it will also collect profiling trace.'
    })
    .option('video', {
      type: 'boolean',
      describe:
        'Record a video and store the video. Set it to false to remove the video that is created by turning on visualMetrics. To remove fully turn off video recordings, make sure to set video and visualMetrics to false. Requires FFMpeg to be installed.'
    })
    .option('videoParams.framerate', {
      default: framerate,
      describe: 'Frames per second',
      group: 'video'
    })
    .option('videoParams.crf', {
      default: crf,
      describe:
        'Constant rate factor see https://trac.ffmpeg.org/wiki/Encode/H.264#crf',
      group: 'video'
    })
    .option('videoParams.addTimer', {
      type: 'boolean',
      default: addTimer,
      describe: 'Add timer and metrics to the video.',
      group: 'video'
    })
    .option('videoParams.debug', {
      type: 'boolean',
      default: false,
      describe:
        'Turn on debug to record a video with all pre/post and scripts/URLS you test in one iteration. Visual Metrics will then automatically be disabled.',
      group: 'video'
    })
    .option('videoParams.keepOriginalVideo', {
      type: 'boolean',
      default: false,
      describe:
        'Keep the original video. Use it when you have a Visual Metrics bug and want to create an issue at GitHub',
      group: 'video'
    })
    .option('videoParams.thumbsize', {
      default: 400,
      describe:
        'The maximum size of the thumbnail in the filmstrip. Default is 400 pixels in either direction. If videoParams.filmstripFullSize is used that setting overrides this.',
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
    .option('videoParams.nice', {
      default: 0,
      describe:
        'Use nice when running FFMPEG during the run. A value from -20 to 19  https://linux.die.net/man/1/nice',
      group: 'video'
    })
    .option('videoParams.taskset', {
      describe:
        'Start FFMPEG with taskset -c <CPUS> to pin FFMPG to specific CPU(s). Specify a numerical list of processors. The list may contain multiple items, separated by comma, and ranges. For example, "0,5,7,9-11".',
      group: 'video'
    })
    .option('videoParams.convert', {
      type: 'boolean',
      default: true,
      describe:
        'Convert the original video to a viewable format (for most video players). Turn that off to make a faster run.',
      group: 'video'
    })
    .option('videoParams.threads', {
      default: threads,
      describe:
        'Number of threads to use for video recording. Default is determined by ffmpeg.',
      group: 'video'
    })
    .option('visualMetrics', {
      type: 'boolean',
      describe:
        'Collect Visual Metrics like First Visual Change, SpeedIndex, Perceptual Speed Index and Last Visual Change. Requires FFMpeg and Python dependencies'
    })
    .option('visualElements', {
      alias: 'visuaElements',
      type: 'boolean',
      describe:
        'Collect Visual Metrics from elements. Works only with --visualMetrics turned on. By default you will get visual metrics from the largest image within the view port and the largest h1. You can also configure to pickup your own defined elements with --scriptInput.visualElements'
    })
    .option('visualMetricsPerceptual', {
      type: 'boolean',
      describe: 'Collect Perceptual Speed Index when you run --visualMetrics.'
    })
    .option('visualMetricsContentful', {
      type: 'boolean',
      describe: 'Collect Contentful Speed Index when you run --visualMetrics.'
    })
    .option('visualMetricsPortable', {
      type: 'boolean',
      default: true,
      describe:
        'Use the portable visual-metrics processing script (no ImageMagick dependencies).'
    })
    .option('visualMetricsKeyColor', {
      type: 'array',
      nargs: 8,
      describe:
        'Collect Key Color frame metrics when you run --visualMetrics. Each --visualMetricsKeyColor supplied must have 8 arguments: key name, red channel (0-255) low and high, green channel (0-255) low and high, blue channel (0-255) low and high, fraction (0.0-1.0) of pixels that must match each channel.'
    })
    .option('scriptInput.visualElements', {
      describe:
        'Include specific elements in visual elements. Give the element a name and select it with document.body.querySelector. Use like this: --scriptInput.visualElements name:domSelector see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors. Add multiple instances to measure multiple elements. Visual Metrics will use these elements and calculate when they are visible and fully rendered.'
    })
    .option('scriptInput.longTask', {
      alias: 'minLongTaskLength',
      description:
        'Set the minimum length of a task to be categorised as a CPU Long Task. It can never be smaller than 50. The value is in ms and only works in Chromium browsers at the moment.',
      type: 'number',
      default: 50
    })
    .option('browser', {
      alias: 'b',
      default: 'chrome',
      choices: ['chrome', 'firefox', 'edge', 'safari'],
      describe:
        'Specify browser. Safari only works on OS X/iOS. Edge only work on OS that supports Edge.'
    })
    .option('android.ignoreShutdownFailures', {
      alias: 'ignoreShutdownFailures',
      type: 'boolean',
      default: false,
      describe: 'If set, shutdown failures will be ignored on Android.',
      group: 'android'
    })
    .option('android', {
      type: 'boolean',
      default: false,
      describe:
        'Short key to use Android. Defaults to use com.android.chrome unless --browser is specified.'
    })
    .option('android.rooted', {
      type: 'boolean',
      alias: 'androidRooted',
      default: false,
      describe:
        'If your phone is rooted you can use this to set it up following Mozillas best practice for stable metrics.',
      group: 'android'
    })
    .option('android.pinCPUSpeed', {
      alias: 'androidPinCPUSpeed',
      choices: ['min', 'middle', 'max'],
      default: 'min',
      describe:
        'Using a Samsung A51 or Moto G5 you can choose how to pin the CPU to better align the speed with your users. This only works on rooted phones and together with --android.rooted',
      group: 'android'
    })
    .option('android.batteryTemperatureLimit', {
      alias: 'androidBatteryTemperatureLimit',
      type: 'integer',
      describe:
        'Do the battery temperature need to be below a specific limit before we start the test?',
      group: 'android'
    })
    .option('android.batteryTemperatureWaitTimeInSeconds', {
      alias: 'androidBatteryTemperatureWaitTimeInSeconds',
      type: 'integer',
      default: 120,
      describe:
        'How long time to wait (in seconds) if the androidBatteryTemperatureWaitTimeInSeconds is not met before the next try',
      group: 'android'
    })
    .option('android.batteryTemperatureReboot', {
      alias: 'androidBatteryTemperatureReboot',
      type: 'boolean',
      default: false,
      describe:
        'If your phone does not get the minimum temperature aftet the wait time, reboot the phone.',
      group: 'android'
    })
    .option('android.pretestPowerPress', {
      alias: 'androidPretestPowerPress',
      type: 'boolean',
      default: false,
      describe: 'Press the power button on the phone before a test starts.',
      group: 'android'
    })
    .option('android.pretestPressHomeButton', {
      alias: 'androidPretestPressHomeButton',
      type: 'boolean',
      default: false,
      describe: 'Press the home button on the phone before a test starts.',
      group: 'android'
    })
    .option('android.verifyNetwork', {
      alias: 'androidVerifyNetwork',
      type: 'boolean',
      default: false,
      describe:
        'Before a test start, verify that the device has a Internet connection by pinging 8.8.8.8 (or a configurable domain with --androidPingAddress)',
      group: 'android'
    })
    /** Process start time.  Android-only for now. */
    .option('processStartTime', {
      type: 'boolean',
      default: false,
      describe:
        'Capture browser process start time (in milliseconds). Android only for now.'
    })
    .option('edge.edgedriverPath', {
      describe:
        'Path to custom msedgedriver version (need to match your Egde version).',
      group: 'edge'
    })
    .option('edge.binaryPath', {
      describe: 'Path to custom Edge binary',
      group: 'edge'
    })
    .option('safari.ios', {
      default: false,
      describe:
        'Use Safari on iOS. You need to choose browser Safari and iOS to run on iOS.',
      type: 'boolean',
      group: 'safari'
    })
    .option('safari.deviceName', {
      describe:
        'Set the device name. Device names for connected devices are shown in iTunes.',
      group: 'safari'
    })
    .option('safari.deviceUDID', {
      describe:
        'Set the device UDID. If Xcode is installed, UDIDs for connected devices are available via the output of "xcrun simctl list devices" and in the Device and Simulators window (accessed in Xcode via "Window > Devices and Simulators")',
      group: 'safari'
    })
    .option('safari.deviceType', {
      describe:
        'Set the device type. If the value of safari:deviceType is `iPhone`, safaridriver will only create a session using an iPhone device or iPhone simulator. If the value of safari:deviceType is `iPad`, safaridriver will only create a session using an iPad device or iPad simulator.',
      group: 'safari'
    })
    .option('safari.useTechnologyPreview', {
      type: 'boolean',
      default: false,
      describe: 'Use Safari Technology Preview',
      group: 'safari'
    })
    .option('safari.diagnose', {
      describe:
        'When filing a bug report against safaridriver, it is highly recommended that you capture and include diagnostics generated by safaridriver. Diagnostic files are saved to ~/Library/Logs/com.apple.WebDriver/',
      group: 'safari'
    })
    .option('safari.useSimulator', {
      describe:
        'If the value of useSimulator is true, safaridriver will only use iOS Simulator hosts. If the value of safari:useSimulator is false, safaridriver will not use iOS Simulator hosts. NOTE: An Xcode installation is required in order to run WebDriver tests on iOS Simulator hosts.',
      default: false,
      type: 'boolean',
      group: 'safari'
    })
    /** Screenshot */
    .option('screenshot', {
      type: 'boolean',
      default: false,
      describe: 'Save one screenshot per iteration.',
      group: 'Screenshot'
    })
    .option('screenshotLCP', {
      type: 'boolean',
      default: false,
      describe:
        'Save one screenshot per iteration that shows the largest contentful paint element (if the browser supports LCP).',
      group: 'Screenshot'
    })
    .option('screenshotLS', {
      type: 'boolean',
      default: false,
      describe:
        'Save one screenshot per iteration that shows the layout shift elements (if the browser supports layout shift).',
      group: 'Screenshot'
    })
    .option('screenshotParams.type', {
      describe: 'Set the file type of the screenshot',
      choices: ['png', 'jpg'],
      default: screenshotDefaults.type,
      group: 'Screenshot'
    })
    .option('screenshotParams.png.compressionLevel', {
      describe: 'zlib compression level',
      default: screenshotDefaults.png.compressionLevel,
      group: 'Screenshot'
    })
    .option('screenshotParams.jpg.quality', {
      describe: 'Quality of the JPEG screenshot. 1-100',
      default: screenshotDefaults.jpg.quality,
      group: 'Screenshot'
    })
    .option('screenshotParams.maxSize', {
      describe: 'The max size of the screenshot (width and height).',
      default: screenshotDefaults.maxSize,
      group: 'Screenshot'
    })
    .option('pageCompleteCheck', {
      describe:
        'Supply a JavaScript (inline or JavaScript file) that decides when the browser is finished loading the page and can start to collect metrics. The JavaScript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings happening after the loadEventEnd. By default the tests ends 2 seconds after loadEventEnd. Also checkout --pageCompleteCheckInactivity and --pageCompleteCheckPollTimeout',
      group: 'PageLoad'
    })
    .option('pageCompleteWaitTime', {
      describe:
        'How long time you want to wait for your pageComplteteCheck to finish, after it is signaled to closed. Extra parameter passed on to your pageCompleteCheck.',
      default: 8000,
      group: 'PageLoad'
    })
    .option('pageCompleteCheckInactivity', {
      describe:
        'Alternative way to choose when to end your test. This will wait for 2 seconds of inactivity that happens after loadEventEnd.',
      type: 'boolean',
      default: false,
      group: 'PageLoad'
    })
    .option('pageCompleteCheckNetworkIdle', {
      describe:
        'Alternative way to choose when to end your test that works in Chrome and Firefox. Uses CDP or WebDriver Bidi to look at network traffic instead of running JavaScript in the browser to know when to end the test. By default this will wait 5 seconds of inactivity in the network log (no requets/responses in 5 seconds). Use --timeouts.networkIdle to change the 5 seconds. The test will end after 2 minutes if there is still activity on the network. You can change that timout using --timeouts.pageCompleteCheck ',
      type: 'boolean',
      default: false,
      group: 'PageLoad'
    })
    .option('pageCompleteCheckPollTimeout', {
      type: 'number',
      default: 1500,
      describe:
        'The time in ms to wait for running the page complete check the next time.',
      group: 'PageLoad'
    })
    .option('pageCompleteCheckStartWait', {
      type: 'number',
      default: 5000,
      describe:
        'The time in ms to wait for running the page complete check for the first time. Use this when you have a pageLoadStrategy set to none',
      group: 'PageLoad'
    })
    .option('pageLoadStrategy', {
      type: 'string',
      default: 'none',
      choices: ['eager', 'none', 'normal'],
      describe:
        'Set the strategy to waiting for document readiness after a navigation event. After the strategy is ready, your pageCompleteCheck will start running.',
      group: 'PageLoad'
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
    .option('timeToSettle', {
      type: 'number',
      default: 0,
      describe:
        'Extra time added for the browser to settle before starting to test a URL. This delay happens after the browser was opened and before the navigation to the URL',
      group: 'PageLoad'
    })
    .option('webdriverPageload', {
      type: 'boolean',
      describe:
        'Use webdriver.get to initialize the page load instead of window.location.',
      default: false,
      group: 'PageLoad'
    })
    .option('proxy.pac', {
      type: 'string',
      describe: 'Proxy auto-configuration (URL)',
      group: 'proxy'
    })
    .option('proxy.ftp', {
      type: 'string',
      describe: 'Ftp proxy (host:port)',
      group: 'proxy'
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
    .option('proxy.bypass', {
      type: 'string',
      describe:
        'Comma separated list of hosts to connect to directly, bypassing other proxies for that host',
      group: 'proxy'
    })
    .option('connectivity.profile', {
      alias: 'c',
      default: 'native',
      choices: [
        '4g',
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
    .option('connectivity.down', {
      alias: 'connectivity.downstreamKbps',
      default: undefined,
      describe:
        'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.up', {
      alias: 'connectivity.upstreamKbps',
      default: undefined,
      describe:
        'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.rtt', {
      alias: 'connectivity.latency',
      default: undefined,
      describe:
        'This option requires --connectivity.profile be set to "custom".',
      group: 'connectivity'
    })
    .option('connectivity.variance', {
      default: undefined,
      describe:
        'This option requires --connectivity.engine be set to "throttle". It will add a variance to the rtt between each run. --connectivity.variance 2 means it will run with a random variance of max 2% between runs.',
      group: 'connectivity'
    })
    .option('connectivity.alias', {
      default: undefined,
      describe: 'Give your connectivity profile a custom name',
      group: 'connectivity'
    })
    .option('connectivity.engine', {
      default: 'external',
      choices: ['external', 'throttle', 'humble'],
      describe:
        'The engine for connectivity. Throttle works on Mac and tc based Linux. For mobile you can use Humble if you have a Humble setup. Use external if you set the connectivity outside of Browsertime. The best way do to this is described in https://github.com/sitespeedio/browsertime#connectivity.',
      group: 'connectivity'
    })
    .option('connectivity.throttle.localhost', {
      default: false,
      type: 'boolean',
      describe:
        'Add latency/delay on localhost. Perfect for testing with WebPageReplay',
      group: 'connectivity'
    })
    .option('connectivity.humble.url', {
      type: 'string',
      describe:
        'The path to your Humble instance. For example http://raspberrypi:3000',
      group: 'connectivity'
    })
    .option('requestheader', {
      alias: 'r',
      describe:
        'Request header that will be added to the request. Add multiple instances to add multiple request headers. Works for Edge and Chrome. Use the following format key:value'
    })
    .option('cookie', {
      describe:
        'Cookie that will be added to the request. Add multiple instances to add multiple request cookies. Works for Firefox, Chrome and Edge. Use the following format cookieName=cookieValue'
    })
    .option('injectJs', {
      describe:
        'Inject JavaScript into the current page at document_start. Works for Firefox, Chrome and Edge. When injecting to Firefox make sure to wrap the code in a function!'
    })
    .option('block', {
      describe:
        'Domain to block or URL or URL pattern to block. If you use Chrome you can also use --blockDomainsExcept (that is more performant). Works in Chrome/Edge. For Firefox you block a URL if you start with http else you will block by setting a domain, like upload.wikimedia.org'
    })
    .option('percentiles', {
      type: 'array',
      default: [0, 10, 90, 99, 100],
      describe:
        'The percentile values within the data browsertime will calculate and report. This argument uses Yargs arrays and you you to set them correctly it is recommended to use a configuraration file instead.'
    })
    .option('decimals', {
      type: 'number',
      default: 0,
      describe: 'The decimal points browsertime statistics round to.'
    })
    .option('iqr', {
      describe:
        'Use IQR, or Inter Quartile Range filtering filters data based on the spread of the data. See  https://en.wikipedia.org/wiki/Interquartile_range. In some cases, IQR filtering may not filter out anything. This can happen if the acceptable range is wider than the bounds of your dataset. ',
      type: 'boolean',
      default: false
    })
    .option('cacheClearRaw', {
      describe:
        'Use internal browser functionality to clear browser cache between runs instead of only using Selenium.',
      type: 'boolean',
      default: false,
      group: 'PageLoad'
    })
    .option('basicAuth', {
      describe:
        'Use it if your server is behind Basic Auth. Format: username@password (Only Chrome and Firefox at the moment).'
    })
    .option('preScript', {
      alias: 'setUp',
      describe:
        'Selenium script(s) to run before you test your URL/script. They will run outside of the analyse phase. Note that --preScript can be passed multiple times.'
    })
    .option('postScript', {
      alias: 'tearDown',
      describe:
        'Selenium script(s) to run after you test your URL. They will run outside of the analyse phase. Note that --postScript can be passed multiple times.'
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
    .option('appendToUserAgent', {
      describe:
        'Append a String to the user agent. Works in Chrome/Edge and Firefox.'
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
    .option('gzipHar', {
      type: 'boolean',
      describe: 'Pass --gzipHar to gzip the HAR file'
    })
    .option('config', {
      describe:
        'Path to JSON config file. You can also use a .browsertime.json file that will automatically be found by Browsertime using find-up.',
      config: 'config'
    })
    .option('viewPort', {
      describe:
        'Size of browser window WIDTHxHEIGHT or "maximize". Note that "maximize" is ignored for xvfb.'
    })
    .option('resultDir', {
      describe: 'Set result directory for the files produced by Browsertime'
    })
    .option('useSameDir', {
      describe:
        'Store all files in the same structure and do not use the path structure released in 4.0. Use this only if you are testing ONE URL.'
    })
    .option('xvfb', {
      type: 'boolean',
      default: false,
      describe: 'Start xvfb before the browser is started'
    })
    .option('xvfbParams.display', {
      default: xvfbDisplay,
      describe: 'The display used for xvfb'
    })
    .option('tcpdump', {
      type: 'boolean',
      default: false,
      describe: 'Collect a tcpdump for each tested URL.'
    })
    .option('tcpdumpPacketBuffered', {
      type: 'boolean',
      default: false,
      describe:
        'Use together with --tcpdump to save each packet directly to the file, instead of buffering.'
    })
    .option('urlAlias', {
      describe:
        'Use an alias for the URL. You need to pass on the same amount of alias as URLs. The alias is used as the name of the URL and used for filepath. Pass on multiple --urlAlias for multiple alias/URLs. You can also add alias direct in your script.',
      type: 'string'
    })
    .option('preURL', {
      alias: 'warmLoad',
      describe:
        'A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the browser cache.'
    })
    .option('preURLDelay', {
      alias: 'warmLoadDealy',
      describe:
        'Delay between preURL and the URL you want to test (in milliseconds)',
      type: 'integer',
      default: 1500
    })
    .option('userTimingAllowList', {
      describe:
        'All userTimings are captured by default this option takes a regex that will allow which userTimings to capture in the results.'
    })
    .option('userTimingBlockList', {
      describe:
        'All userTimings are captured by default this option takes a regex that will block some usertimings in the results.'
    })
    .option('headless', {
      type: 'boolean',
      default: false,
      describe:
        'Run the browser in headless mode. Works for Firefox and Chrome.'
    })
    .option('android.gnirehtet', {
      alias: 'gnirehtet',
      type: 'boolean',
      default: false,
      describe:
        'Start gnirehtet and reverse tethering the traffic from your Android phone.',
      group: 'android'
    })
    .option('flushDNS', {
      type: 'boolean',
      default: false,
      describe:
        'Flush DNS between runs, works on Mac OS and Linux. Your user needs sudo rights to be able to flush the DNS.',
      group: 'PageLoad'
    })
    .option('extension', {
      describe:
        'Path to a WebExtension to be installed in the browser. Note that --extension can be passed multiple times.'
    })
    .option('spa', {
      describe:
        'Convenient parameter to use if you test a SPA application: will automatically wait for X seconds after last network activity and use hash in file names. Read more: https://www.sitespeed.io/documentation/sitespeed.io/spa/',
      type: 'boolean',
      default: false,
      group: 'PageLoad'
    })
    .option('cjs', {
      describe:
        'Load scripting files that ends with .js as common js. Default (false) loads files as esmodules.',
      type: 'boolean',
      default: false
    })
    .option('browserRestartTries', {
      type: 'number',
      default: 3,
      describe:
        'If the browser fails to start, you can retry to start it this amount of times.',
      group: 'PageLoad'
    })
    .option('preWarmServer', {
      type: 'boolean',
      default: false,
      describe:
        'Do pre test requests to the URL(s) that you want to test that is not measured. Do that to make sure your web server is ready to serve. The pre test requests is done with another browser instance that is closed after pre testing is done.'
    })
    .option('preWarmServerWaitTime', {
      type: 'number',
      default: 5000,
      describe:
        'The wait time before you start the real testing after your pre-cache request.'
    })
    .option('debug', {
      type: 'boolean',
      default: false,
      describe: 'Run Browsertime in debug mode.',
      group: 'debug'
    })

    .count('verbose')
    .config(config)
    .string('_')
    .help('h')
    .alias('h', 'help')
    .alias('V', 'version')
    .alias('v', 'verbose')
    .wrap(yargsInstance.terminalWidth())
    .check(validateInput);

  let argv = validated.argv;

  if (
    argv.firefox &&
    (argv.firefox.nightly || argv.firefox.beta || argv.firefox.developer)
  ) {
    argv.browser = 'firefox';
    if (argv.android.enabled) {
      // TODO add support for Firefox dev
      setProperty(
        argv,
        'firefox.android.package',
        argv.firefox.nightly ? 'org.mozilla.fenix' : 'org.mozilla.firefox_beta'
      );

      setProperty(
        argv,
        'firefox.android.activity',
        'org.mozilla.fenix.IntentReceiverActivity'
      );
    }
  }

  if (argv.ios) {
    setProperty(argv, 'safari.ios', true);
  } else if (argv.android.enabled) {
    if (argv.browser === 'chrome') {
      // Default to Chrome Android.
      setProperty(
        argv,
        'chrome.android.package',
        getProperty(argv, 'chrome.android.package', 'com.android.chrome')
      );
    } else if (argv.browser === 'edge') {
      setProperty(
        argv,
        'chrome.android.package',
        getProperty(argv, 'chrome.android.package', 'com.microsoft.emmx')
      );
      setProperty(
        argv,
        'chrome.android.activity',
        getProperty(argv, 'chrome.android.activity', 'com.microsoft.ruby.Main')
      );
    }
  }

  if (argv.safari && argv.safari.useSimulator) {
    setProperty(argv, 'connectivity.engine', 'throttle');
  }

  // Always use hash by default when you configure spa
  if (argv.spa) {
    setProperty(argv, 'useHash', true);
  }

  if (argv.urlAlias) {
    let urls = argv._;
    let urlMetaData = {};

    if (!Array.isArray(argv.urlAlias)) argv.urlAlias = [argv.urlAlias];

    for (const [index, url] of urls.entries()) {
      urlMetaData[url] = argv.urlAlias[index];
    }
    setProperty(argv, 'urlMetaData', urlMetaData);
  }

  // Simplest way to just to get CPU metrics
  if (argv.cpu) {
    if (argv.browser === 'chrome' || argv.browser === 'edge') {
      setProperty(argv, 'chrome.timeline', true);
    } else if (argv.browser === 'firefox') {
      setProperty(argv, 'firefox.geckoProfiler', true);
    }
  }

  if (argv.docker) {
    setProperty(argv, 'video', getProperty(argv, 'video', true));
    setProperty(
      argv,
      'visualMetrics',
      getProperty(argv, 'visualMetrics', true)
    );
  }

  // Set the timeouts to a maximum while debugging
  if (argv.debug) {
    setProperty(argv, 'timeouts.pageload', 2_147_483_647);
    setProperty(argv, 'timeouts.script', 2_147_483_647);
    setProperty(argv, 'timeouts.pageCompleteCheck', 2_147_483_647);
  }

  return {
    urls: argv._,
    options: argv
  };
}
