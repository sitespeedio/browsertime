# Browsertime - Your browser, your page, your scripts!
[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![Stars][stars-image]][stars-url]

![Browsertime](browsertime.png)

Access the Web Performance Timeline, from your browser, in your terminal!

Browsertime allows you to:
 1. Query timing data directly from the browser, to access [Navigation Timing](http://kaaes.github.io/timing/info.html), [User Timing](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/),
[Resource Timing](http://www.w3.org/TR/resource-timing/), first paint and [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex).
 1. Generate [HAR](http://www.softwareishard.com/blog/har-12-spec/) files (using [HAR Export trigger] (https://github.com/firebug/har-export-trigger) for Firefox and parsing the Chrome log for Chrome).
 1. Run custom Javascript scripts in the browser and get statistics for each run.
 1. Record a video of the screen and analyze the result to get First Visual Change, Speed Index, Visual Complete 85 % and Last Visual Change.

## A simple example

<pre>
$ bin/browsertime.js https://www.sitespeed.io
</pre>

Load https://www.sitespeed.io in Chrome three times. Results are stored in a JSON file (browsertime.json) with the timing data, and a HAR file (browsertime.har) in browsertime-results/www.sitespeed.io/$date/

## I want more examples
Checkout the [examples](docs/examples/README.md).

## Browsers
Browsertime supports Firefox and Chrome on desktop. On Android we support Chrome.

But we want to [support Opera (on Android)](https://github.com/tobli/browsertime/issues/150)  and when(?!) iOS Safari supports WebDriver we will add that too.

## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, load a URL, executes configurable Javascripts to collect metrics, collect a HAR file.

To get the HAR from Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and Chrome we use [Chrome-HAR](https://github.com/sitespeedio/chrome-har) to parse the timeline log and generate the HAR file.

Oh and you can run your own Selenium script before (<code>--preScript</code>) and after (<code>--postScript</code>) a URL is accessed so you can login/logout or do whatever you want.

# Speed Index and video
It's easiest to run [our ready made Docker container](https://hub.docker.com/r/sitespeedio/browsertime/) to be able to record a video and calculate SpeedIndex because then you get all dependencies needed for free to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

The default video will include a timer and showing when the metrics happens, but you can turn that off using <code>--videoRaw</code>.

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/video-example.gif">

## Test using Docker
You can build and test changes using Docker locally.

<pre>
$ docker build -t sitespeedio/browsertime .
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime -n 1 -c cable --video --speedIndex https://www.sitespeed.io/
</pre>

## Configuration
Run <code>$ bin/browsertime.js --help</code> and you can see the configuration options:

<pre>
bin/browsertime.js [options] <url>

timeouts
  --timeouts.browserStart       Timeout when waiting for browser to start, in milliseconds                                           [number] [default: 60000]
  --timeouts.pageLoad           Timeout when waiting for url to load, in milliseconds                                               [number] [default: 300000]
  --timeouts.script             Timeout when running browser scripts, in milliseconds                                                [number] [default: 80000]
  --timeouts.pageCompleteCheck  Timeout when waiting for page to complete loading, in milliseconds                                  [number] [default: 300000]

chrome
  --chrome.args                        Extra command line arguments to pass to the Chrome process (e.g. --no-sandbox). To add multiple arguments to Chrome,
                                       repeat --chrome.args once per argument.
  --chrome.binaryPath                  Path to custom Chrome binary (e.g. Chrome Canary). On OS X, the path should be to the binary inside the app bundle,
                                       e.g. /Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary
  --chrome.chromedriverPath            Path to custom Chromedriver binary. Make sure to use a Chromedriver version that's compatible with the version of
                                       Chrome you're using
  --chrome.mobileEmulation.deviceName  Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add company like 'Apple iPhone 6')
  --chrome.mobileEmulation.width       Width in pixels of emulated mobile screen (e.g. 360)                                                           [number]
  --chrome.mobileEmulation.height      Height in pixels of emulated mobile screen (e.g. 640)                                                          [number]
  --chrome.mobileEmulation.pixelRatio  Pixel ratio of emulated mobile screen (e.g. 2.0)
  --chrome.android.package             Run Chrome on your Android device. Set to com.android.chrome for default Chrome version.
  --chrome.android.deviceSerial        Choose which device to use. If you do not set it, random device will be used.
  --chrome.collectTracingEvents        Include Tracing events in the performance log (implies chrome.collectPerfLog).                                [boolean]
  --chrome.traceCategories             A comma separated list of Tracing event categories to include in the performance log (implies
                                       chrome.collectTracingEvents).                                                                                  [string]
  --chrome.collectPerfLog              Collect performance log from Chrome with Page and Network events and save to disk.                            [boolean]
  --chrome.collectNetLog               Collect network log from Chrome and save to disk.                                                             [boolean]

firefox
  --firefox.binaryPath             Path to custom Firefox binary (e.g. Firefox Nightly). On OS X, the path should be to the binary inside the app bundle, e.g.
                                   /Applications/Firefox.app/Contents/MacOS/firefox-bin
  --firefox.preference             Extra command line arguments to pass Firefox preferences by the format key:value To add multiple preferences, repeat
                                   --firefox.preference once per argument.
  --firefox.includeResponseBodies  Include response bodies in HAR                                                                                    [boolean]

selenium
  --selenium.url  URL to a running Selenium server (e.g. to run a browser on another machine).

proxy
  --proxy.http   Http proxy (host:port)                                                                                                               [string]
  --proxy.https  Https proxy (host:port)                                                                                                              [string]

connectivity
  --connectivity.profile, -c     The connectivity profile.  [choices: "3g", "3gfast", "3gslow", "3gem", "2g", "cable", "native", "custom"] [default: "native"]
  --connectivity.downstreamKbps  This option requires --connectivity.profile be set to "custom".
  --connectivity.upstreamKbps    This option requires --connectivity.profile be set to "custom".
  --connectivity.latency         This option requires --connectivity.profile be set to "custom".
  --connectivity.alias           Give your connectivity profile a custom name
  --connectivity.tsproxy.port    The port used for ts proxy                                                                                    [default: 1080]
  --connectivity.tc.device       The connectivity device. Used for engine tc.                                                                [default: "eth0"]
  --connectivity.engine          The engine for connectivity. TSProxy needs Python 2.7. TC (Linux Traffic Control) needs tc work but will only setup upload
                                 and latency. Use external if you set the connectivity outside of Browsertime.
                                                                                                   [choices: "tc", "tsproxy", "external"] [default: "tsproxy"]

Options:
  --video                Record a video. Requires FFMpeg to be installed                                                                             [boolean]
  --videoRaw             Do not add timer and metrics to the video                                                                                   [boolean]
  --speedIndex           Calculate SpeedIndex. Requires FFMpeg and python dependencies                                                               [boolean]
  --browser, -b          Specify browser                                                                    [choices: "chrome", "firefox"] [default: "chrome"]
  --screenshot           Save one screen shot per iteration.                                                                                         [boolean]
  --pageCompleteCheck    Supply a Javascript that decides when the browser is finished loading the page and can start to collect metrics. The Javascript
                         snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings
                         happening after the loadEventEnd.
  --iterations, -n       Number of times to test the url (restarting the browser between each test)                                      [number] [default: 3]
  --prettyPrint          Enable to print json/har with spaces and indentation. Larger files, but easier on the eye.                 [boolean] [default: false]
  --delay                Delay between runs, in milliseconds                                                                             [number] [default: 0]
  --preScript            Selenium script(s) to run before you test your URL (use it for login, warm the cache, etc). Note that --preScript can be passed
                         multiple times.
  --postScript           Selenium script(s) to run after you test your URL (use it for logout etc). Note that --postScript can be passed multiple times.
  --script               Add custom Javascript to run after the page has finished loading to collect metrics. If a single js file is specified, it will be
                         included in the category named "custom" in the output json. Pass a folder to include all .js scripts in the folder, and have the
                         folder name be the category. Note that --script can be passed multiple times.
  --userAgent            Override user agent
  --silent, -q           Only output info in the logs, not to the console. Enter twice to suppress summary line.                                       [count]
  --output, -o           Specify file name for Browsertime data (ex: 'browsertime'). Unless specified, file will be named browsertime.json
  --har                  Specify file name for .har file (ex: 'browsertime'). Unless specified, file will be named browsertime.har
  --skipHar              Pass --skipHar to not collect a HAR file.                                                                                   [boolean]
  --config               Path to JSON config file
  --viewPort             Size of browser window WIDTHxHEIGHT or "maximize". Note that "maximize" is ignored for xvfb.
  --resultDir            Set result directory for the files produced by Browsertime
  --xvfb                 Start xvfb before the browser is started                                                                   [boolean] [default: false]
  --preURL               A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the cache.
  --userTimingWhitelist  All userTimings are captured by default this option takes a regex that will whitelist which userTimings to capture in the results.
  -h, --help             Show help                                                                                                                   [boolean]
  -V, --version          Show version number                                                                                                         [boolean]
  </pre>

[travis-image]: https://img.shields.io/travis/sitespeedio/browsertime.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/browsertime
[stars-url]: https://github.com/tobli/sitespeedio/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/browsertime.svg?style=flat-square
[downloads-image]: http://img.shields.io/npm/dm/browsertime.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/browsertime
