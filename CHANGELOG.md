# Browsertime changelog

UNRELEASED
-------------------------
### Added
* Improved detection of http2 pushed assets for Chrome. #261

version 1.0.0-beta.25 2017-02-15
-------------------------
### Added
* Make it possible to include response bodies in the HAR from Firefox using --firefox.includeResponseBodies [#264](https://github.com/sitespeedio/browsertime/pull/264/)
* Set Firefox preferences through the CLI [#268](https://github.com/sitespeedio/browsertime/issues/268)

### Fixed
* Add check if entry is not undefined and request exists when creating the Chrome HAR fixes[#272](https://github.com/sitespeedio/browsertime/issues/272)

version 1.0.0-beta.24 2017-02-10
-------------------------
### Added
* New option `--userTimingWhitelist` to pass a whitelist regex for filtering userTimings from results

### Fixed
* Updated example of login via pre-script to properly wait for login form to be submitted before continuing.
* Simpliefied check in Chrome if a response is pushed (only use pushStart)
* Renamed _was_push to _was_pushed as following same name standard as WPT if an entry is HTTP/2 pushed
* Aligned priority information in HAR with WebPageTest.
* Upgraded to Geckodriver 0.14.0

version 1.0.0-beta.23 2017-01-10
-------------------------
### Fixed
* The combination of not cropping out the center of the screen and changin back to default values for Firefox deciding when the screen is orange, 
  made all metrics happen to early for FF.

version 1.0.0-beta.22 2017-01-10
-------------------------
### Fixed
* Different values for Chrome/Firefox to define when the screen is still orange, to make sure VisualMetrics doesn't pick up the 
  orange screen.

version 1.0.0-beta.21 2017-01-09
-------------------------
### Added
* Upgraded to Geckodriver 0.13.0
* Upgraded to Chromedriver 2.27.0
* Eliminate the risk to get a too early first visual change that happens sometimes in Chrome by changing VisualMetrics (see #247 and #255):
  * We removed the center cropping of images when visual metrics checks if an image is orange/white. The cropping made us miss the small orange lines that sometimes appear only in Chrome.
  * We also fine tuned (and made configurable) the number when the diff of two images (orange and white) is ... orange.
  * We re-arranged how we record the screen to record as little extra video as possible.

version 1.0.0-beta.20 2017-01-05
-------------------------
### Added
* Upgraded to Geckodriver 0.12.0
* Pickup changed prio when Chrome changes prio for requests
* Updated the Docker container to use ImageMagick 6.9.7-2 to fix https://github.com/sitespeedio/browsertime/issues/247
* Added 3g connectivity profile 3gem for Emerging markets to keep in sync with WebPageTest.
* Removed crf settings when recording a video to fix https://github.com/sitespeedio/browsertime/issues/247

version 1.0.0-beta.19 2016-12-22
-------------------------
### Fixed
* Use VisualMetrics with viewport config to best case find better start values
* Ignore 5% of the height/width when calculate firstVisualChange fixed #244

version 1.0-beta.18 2016-12-14
-------------------------
### Added
* Upgraded to Chromedriver 2.26

### Fixed
* Changed to use straight walltime when generating HAR for HTTP/2 in Chrome (fixes problems when assets was in wrong order)
* Log request missing matching request id on debug level instead of warning

version 1.0-beta.17 2016-12-13
-------------------------
### Fixed
* Setting 'network.dns.disableIPv6': true for Firefox makes Firefox in Docker 5s faster :/

* Added trap in Docker image to be able to break your runs.

version 1.0-beta.16 2016-12-12
-------------------------
### Fixed
* Increased time to wait for browser to start before starting video (now 1.5 s)

version 1.0-beta.15 2016-12-10
-------------------------
### Added
* Log last visual change in the info logs after a run.
* Added _was_pushed using same standard as WebPageTest.

### Fixed
* Skip checking the first 5 frames when looking for when the video start (that makes the firstVisualRender more stable).
* Getting right URL for initiator in Chrome.

version 1.0-beta.14 2016-12-06
-------------------------
### Added
* Display lastVisualChange in the video (and 2px smaller texts for metrics)

### Fixed
* Fine tune the values on when to catch the first frame #236 to make firstVisualRender more accurate when using preURL

version 1.0-beta.13 2016-11-30
-------------------------
### Added
* Default resource timing buffer is now 600 when you run with video.
* Set your own alias for connectivity https://github.com/sitespeedio/browsertime/pull/222
* Remove the orange color from the video (that makes us sync start) and added optional timer and metrics in the HTML
* You can now choose if you want to have a video: --video and --speedIndex
* Use --preURL to hit a URL before you access the URL you wanna analyze
* We use connectivity engine tc by default in Docker.

### Fixed
* The final mp4 is now compatible with all modern browsers, thank you [Walter Ebert](https://github.com/walterebert) for the help!
* Local cache HAR entries in Firefox is removed https://github.com/sitespeedio/browsertime/pull/227
* Beta.12 broke android testing by setting viewport, fixed for next release.
* Chrome now always start inside of Docker, we finally got rid of the Chrome doesn't start in time problem https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864

version 1.0-beta.12 2016-11-20
-------------------------
### Added
* Add a alias/custom name to your connectivity profile. Thank you @jpvincent for the idea! https://github.com/sitespeedio/sitespeed.io/issues/1329
* Cli option to remove the created video (record the video to get SpeedIndex and then remove the video).
* Video is now mp4.

### Fixed
* Better exit handling when killing FFMpeg , overall code cleanup for ffmpeg/video
* Introduced small wait time before record video that makes the connection problem for 3g using tc go away (hopefully).

### Changed
* Videos are now named after the run.

version 1.0-beta.11 2016-11-13
-------------------------
### Fixed
* Disabled infobars in Chrome (they messed up start render and SpeedIndex).

version 1.0-beta.10 2016-11-11
-------------------------
### Added
* Added initiator of each request entry to chrome HAR
* Output SpeedIndex & firstVisualChange in the logs if you use VisualMetrics

### Fixed
* Generating HAR files from Chrome caused a crash in some cases. (#209)
* Entry timings in HAR files from Chrome were strings instead of numbers.
* One extra fix for outputing timing metrics in the console:  If timing metrics is < 1000 ms don't convert to seconds and let always have fixed\
 size for mdev fixing many numbers for SpeedIndex.

### Changed
* Configure proxies with --proxy.http and --proxy.https
* New TSProxy that is less complex
* Upgraded Selenium to 3.0.1 (no beta!)
* Upgraded Geckodriver to 0.11.1
* Updated minimum NodeJS to 6.9.0 (same as Selenium). IMPORTANT: Selenium 3.0.0 will not work on NodeJS 4.x so you need to update.
* Export chrome perflog dumps as json in extraJson property of the result, instead of a string in the extras property. Only relevant to api users.
* Upgraded sltc so we use 0.6.0 with simplified tc that actually works
* We now run xvfb from inside NodeJS so we can set the screen size, making it easy to record the correct size for VisualMetrics. We also use environment variables that starts with BROWSERTIME so we can turn on xvfb easily on Docker.

version 1.0-beta.9 2016-10-16
-------------------------
### Fixed
* Set default device to eth0 when running tc (without using the CLI).


version 1.0-beta.8 2016-10-16
-------------------------
### Fixed
* Also count the main request in number of requests when printing to the log.
* And output the total transfer size of the tested page.
* New version of TSProxy hopefully fixing the connect problems for some
sites (wikipedia) see https://github.com/WPO-Foundation/tsproxy/issues/9


### Changed
* Removed option to not get statistics for the runs.
* Rollbacked SLTC so we only use tc, to make it work out of the box on Ubuntu.

version 1.0-beta.7 2016-10-17
-------------------------
### Changed
* Moved the summary line to the logs and inside the engine so users of the API will get
the same treatment.

version 1.0-beta.6 2016-09-29
-------------------------
### Added
* Add chrome-esque summary line to stdout #189 thank you @moos for the PR!

### Changed
* Removed JSON input for setting connectivity custom profile, use cli params instead.

version 1.0-beta.5 2016-09-22
-------------------------
### Changed
* Updated to Selenium v3.0.0-beta-3
* Updated to HAR export trigger beta 10 to make FF 49 functional

version 1.0-beta.4 2016-09-19
-------------------------
### Changed
* Updated to chromedriver 2.24.

version 1.0-beta.3 2016-09-02
-------------------------
### Fixed
* Query parameters in HAR files from Chrome are now correct

### Added
* HAR files from Chrome now include cookies and POST data (with some limitations)

version 1.0-beta.2
------------------------
* Log excplicit when the HAR export trigger fails, so it is easy to report the problem.
* Increased the default script timeout from 40 s to 80 s.
* Log script name if a script fails to make it easier to find failing scripts.
* Renamed the browserscripts/timings/timings.js → browserscripts/timings/pageTimings.js

version 1.0-beta.1
------------------------
* This is the first beta of 1.0. 1.0 is a TOTAL rewrite from 0.12.3. We don't use BrowserMobProxy anymore (so you don't need Java). To get the HAR from Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and Chrome we parse the timeline log and generates the HAR file.

* The beta-1 has no way of blocking requests, if you need that functionality you should wait with upgrading.

version 0.12.3
------------------------
* Upgraded Selenium to work with Firefox 47.0.1

version 0.12.2
------------------------
* Add ability to block urls (e.g. return 404) based on regex.

version 0.12.1
------------------------
* Fix parsing of --headers and --connectionRaw options. Note that JSON strings needs to be properly quoted when
passed on the command line, e.g. --headers '{"name":"value"}'

version 0.12.0
------------------------
* Upgrade selenium-webdriver to 2.47. This means dropping node 0.10 support, but allowing installation on node 4.x.

version 0.11.0
------------------------
* Don't log 'Storing ...har' when har generation is turned off.
* Handle cases where HAR file from MobProxy is lacking log.browser without crashing.
* Set correct Browsertime version in HAR file (previously was always 1.0)
* Remove --useProxy option and replace with a --noProxy flag. Please update your scripts if you use this

version 0.10.2
------------------------
* Bug fix: Running multiple tests, included same requests many many times in one HAR #91

version 0.10.1
------------------------
* Bug fix: Show correct browser and version in the HAR file #90

version 0.10.0
------------------------
* Remove level prefix (e.g. info: ) from console log lines. Log files aren't affected.
* Normalized Navigation Timing Data: All navigation timing metrics are now relative from Navigation start instead of using timestamps #88
* Navigation Timings are now included in the statistics so you can get median times for all Navigation Timing metrics.

version 0.9.8
------------------------
* Upgrading Selenium version to 2.46.1 that makes it work on Windows (again).

version 0.9.7
------------------------
* Upgrading selenium version to 2.46.0 that will make Firefox (38) useable again.

version 0.9.6
------------------------
* Increased timeouts to be 2 minutes instead of 1 minute. Running using mobile2g times out a lot.

version 0.9.5
------------------------
* Added more default connection types: mobile2g and mobile3gslow
* Ability to avoid sandbox mode when runnig Chrome (use with care)

version 0.9.4
------------------------
* Possible to configure a selenium server (hopefully make IE run smoother on Windows and
  Chrome on Linux).

version 0.9.3
------------------------
* User timing marks was missing from statistics since 0.9. This puts then back!
* Timeout a run if it takes too long. On Linux Chrome/Chromedriver can hang, making Browsertime hang. This fix kill the chromedriver and signal an error if it happens.

version 0.9.2
------------------------
* Fixed installation issue on npm v0.12.0, Windows 7 (thanks Patrick Wieczorek)
* Hello HTTPS! We now proxy HTTPS traffic making HAR Files containing HTTPS requests.
* Internet Explorer: Clean session between runs, ignore zoom settings and set proxy per process
* Internal: Killing Chromedriver on Linux if it is up and running after a finished round. Need to be run after each URL when we have a working timeout for Chrome.

version 0.9.1
------------------------
* Fixed incorrect HAR files generated by version 0.9.0 (page title was missing).
* Renaming resourceTiming to resourceTimings to follow our pattern.

version 0.9.0
------------------------
* New data structure in the output JSON, better support for custom Metrics. Note if you fetch values from the JSON, you will need to change how you do it.
* Latest Selenium supports IE and Safari without the Selenium jar, use it! Safari users, install SafariDriver.safariextz from http://selenium-release.storage.googleapis.com/index.html?path=2.45/
* Safari doesn't support pageLoadTimeout, disable for Safari
* Cleaned up the use of javascript that runs in the browser: get name from the filename and keep scripts simple. #77
* Running Browsertime on node.js version 0.8 is no longer supported (or tested).
* Fix incorrect calculation of serverConnectionTime in json output.
* Removed toJSON method from Resource Timing data from Firefox
* Getting window size from the actual window.
* Internally: Get metrics and static values from the browser using JS.
* Set the page title in the HAR
* Added more timings per page, follow WPT style in the HAR
* Changed name of parameter scriptPath to customScripts to better match what it does
* Locking versions in package.json to be SAFE

version 0.8.26
------------------------
## Changed
* Update to Selenium 2.45.1 to get latest bug fixes.
* Avoid hangs when fetching urls by explicitly set timeout values in Selenium drivers.

version 0.8.25
------------------------
* New Selenium version (2.45) to support Firefox 36

version 0.8.24
------------------------
* Fix that kills the BMP on Windows (using taskkill)

version 0.8.23
------------------------
* Log to standard log when uncaught exception happens, so that it will be propagated to sitespeed.io
* So we have a real proble with processes that just hangs, it happens on when we get an uncaught exception,
  one of the problems is Selenium/Chromedriver, we will try to fix the main issue but for now we will exit
  the process #74

version 0.8.22
------------------------
* You can now choose to supply a Javascript that will decide when a run is finished. The default
script is 'return window.performance.timing.loadEventEnd>0'. Use the parameter --waitScript

* The browsermob prixy will now test a port and use it if it's free. Before the port was hardcoded.

version 0.8.21
------------------------
* Upgraded to the new BrowserMobProxy 2.0.0

version 0.8
------------------------
* Ooops, what happend? the new version is written in NodeJS, instead of Java.
* Check out the README or --help to see new input format.
* You can now run your own javascript in the browser and get the data back in the JSON.
* Support for getting timings using PhantomJS 2.
* Limit the connection speed.

version 0.7
------------------------
* Add support for sending BASIC AUTH credentials, by specifying the --basic-auth option.
* Add support for generating har files, by specifying the --har-file option.
* Add support for sending request headers by specifying the --headers option.
* Bugfix: Set right values for serverResponseTime
* Upgrade Selenium to version 2.41.

version 0.6 (2014-02-05)
------------------------
* Fix crash while trying to run resource timing measurements in Firefox.
* Provide better error messages if chromedriver, IEDriverServer or Firefox is missing.
* Upgraded to latest version of Selenium, for (hopefully) increased stability in the interaction with browsers.
* Suppress chromedriver diagnostics output (Starting ChromeDriver...) when running Chrome
* Add --verbose and --debug option for getting additional information printed as Browsertime runs.

version 0.5 (2014-01-09)
------------------------
* Windows support - Browsertime now ships with a bat file, and Internet Explorer has been confirmed to work.
* Collect resource timing metrics (http://www.w3.org/TR/resource-timing/), included when outputting all metrics using
  the --raw option.
* Add support for specifying http proxy, using a new --proxyHost option.
* Updated maven groupId and Java package name to use net.browsertime instead of com.soulgalore. This does not affect
  users of the command line tool, only programmers embedding the browsertime jar in other tools.
* Added ignore zoom settings for Internet Explorer and type for msFirstPaint
* Include browserTimeVersion entry in static page data.

version 0.4 (2013-11-15)
------------------------
* User Timing marks and measures should now be compatible with Firefox 25. Custom user marks are also converted to
  "synthetic" measures, with duration as time from the navigationStart event. This way user marks are also
  included in statistics.

version 0.3 (2013-11-09)
------------------------
* Added frontEndTime (responseEnd & loadEventStart) & backEndTime (navigationStart, responseStart) measurements to make it cleaner when comparing.
* Collect page data (browser version etc.) on first timing run. This reduces the number of times the browser is
  launched, making Browsertime run faster.
* Added -t option to set timeout value when loading urls (default remains 60 seconds).
* Created packages as zip and tar.gz that includes a shell script to run Browsertime, all jars, README, and CHANGELOG.

version 0.2 (2013-11-05)
------------------------
* Add --raw flag to control if data for individual runs is included in output.
  The default is to not include run data. NOTE - this is a change in the default
  output from 0.1.
* Add optional --compact flag to disable pretty printing of xml and json.
* Update format of xml/json (NOTE - incompatible changes from 0.1)
 - all metrics and statistics are now floating point numbers
 - numbers in json output are now represented as strings (surrounded by quotes). This is an
    unfortunate side-effect of avoiding printing numbers in scientific notation.
 - time property of marks and measurements have been renamed startTime
 - measurements and statistics are now sorted according to start time.
* Changed max wait time for the Selenium driver from 30 s to 60 s
* Updated org.seleniumhq.selenium:selenium-java from 2.35.0 to 2.37.1
* Fix for Firefox 25 that added toJson in window.performance.timings

version 0.1 (2013-10-07)
------------------------
* First release
