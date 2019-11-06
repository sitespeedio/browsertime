# Browsertime changelog

## 7.0.1 - 2019-11-07
### Fixed
* There was a bug how we handled data from postScript that made using axe in sitespeed.io in a script, testing multiple URLs fail. Fixed in [#985](https://github.com/sitespeedio/browsertime/pull/985)


## 7.0.0 - 2019-11-02

### Changed
* Finally there's a fix for that the Docker container run Browsertime as root, generating otput owned by root as in [#1459](https://github.com/sitespeedio/sitespeed.io/issues/1459). The fix by [Mason Malone](https://github.com/MasonM) pickup the user of the output directory and uses that user. Thank you again [Mason Malone](https://github.com/MasonM) for the PR, originally in sitespeed.io [#2710](https://github.com/sitespeedio/sitespeed.io/pull/2710) and moved here [#964](https://github.com/sitespeedio/browsertime/pull/964).
* Changed a couple of Firefox settings to follow the Mozilla teams downstream version [#965](https://github.com/sitespeedio/browsertime/pull/965).

### Added
* Added Contentful speed index is a new SI metric developed by Bas Schouten at Mozilla which uses edge detection to calculate the amount of "content" that is visible on each frame, thank you [dpalmeiro](https://github.com/dpalmeiro) for the PR [#976](https://github.com/sitespeedio/browsertime/pull/976).
* Firefox 67 and above has a built-in window recorder ([bug 1536174](https://bugzilla.mozilla.org/show_bug.cgi?id=1536174)) that is able to dump PNG images of each frame that is painted to the window. This can be enabled and disabled in the browser console, or through the chrome context with selenium webdriver.
This PR introduces a new privileged API that is able to execute JS in the chrome context, as well as support for generating a variable rate MP4 using the output images from the window recorder. The motivation for this work was to introduce a low-overhead video recorder that will not introduce performance disturbances during page loads. Thank you [dpalmeiro](https://github.com/dpalmeiro) for the PR [#978](https://github.com/sitespeedio/browsertime/pull/978). You can try it out with `--video --firefox.windowRecorder`
* There's a new way to set variance on your connectivity. At the moment you can only do that when you are using Throttle as engine. You can try it out with `--connectivity.variance 2` - that means the latency will have a variance of 2% between runs. Let us try this out and get back about later on [#973](https://github.com/sitespeedio/browsertime/pull/973). Original idea from Emery Berger.
* Chrome/Chromedriver 78 and Firefox 70.

### Fixed
* Some URLs failed because of that the document.title was an image, as reported in [#979](https://github.com/sitespeedio/browsertime/issues/979) and fixed in [#980](https://github.com/sitespeedio/browsertime/pull/980).
* Hide sudo log when using Docker [#971](https://github.com/sitespeedio/browsertime/pull/971).
* Better log message if the Browser fails to start, thank you [Mason Malone](https://github.com/MasonM) for the PR [#962](https://github.com/sitespeedio/browsertime/pull/962).
* Make it possible to turn off video/visualMetrics using config json in Docker [#967](https://github.com/sitespeedio/browsertime/pull/967).


## 6.1.4 - 2019-10-16
### Fixed
* Upgraded to Geckodriver 0.26.0.

## 6.1.3 - 2019-10-07
### Fixed
* Upgraded to Yargs 14.2.0 that makes it possible to extend configurations in multiple steps (old version only supported one step and was broken for multiple steps).
* TSProxy didn't work since last upgraded. Rollback to earlier TSProxy version in [#957](https://github.com/sitespeedio/browsertime/pull/957)

## 6.1.2 - 2019-10-04
### Fixed
* Adding your own extension to Firefox was broken since 6.0 [#954](https://github.com/sitespeedio/browsertime/issues/954).

## 6.1.1 - 2019-09-26
### Fixed
* If you are using SpeedLine with the trace to create VisualMetrics, metrics was strings instead of numbers in the result json [#951](https://github.com/sitespeedio/browsertime/pull/951).

## 6.1.0 - 2019-09-25
### Added
* Get the first input in Chrome (useful for user journeys) [#948](https://github.com/sitespeedio/browsertime/pull/948).

### Fixed
* Removed settings for enabling LayoutInstabilityAPI in Chrome (is on by default in Chrome 77) [#949](https://github.com/sitespeedio/browsertime/pull/949).
* Fixed a bug for Chrome when you couldn't send more that one request header [#950](https://github.com/sitespeedio/browsertime/pull/950).

## 6.0.4 - 2019-09-22
### Fixed
* Upgraded TSProxy to 1.5 [#945](https://github.com/sitespeedio/browsertime/pull/945) see [TSProxy issue #20](https://github.com/WPO-Foundation/tsproxy/issues/20) for more details.
* Upgraded to latest Chrome-har with extra guard if a response is missing respone data.

## 6.0.3 - 2019-09-14
### Fixed
* New chrome-har that handles when Chrome trace misses a response.

## 6.0.2 - 2019-09-14
### Fixed
* Fixed broken proxy setup for Firefox (and propably Chrome) [#943](https://github.com/sitespeedio/browsertime/pull/943).
* Fixed flickering timer in the video [#944](https://github.com/sitespeedio/browsertime/pull/944).

## 6.0.1 - 2019-09-12
### Fixed
* Updated to Chromedriver 77.0.3865.40 stable from beta version.
* Do not log First paint as undefined when you run your tests on Safari [#941](https://github.com/sitespeedio/browsertime/pull/941)
* Setup the browser the same way when measuring vs only navigating. This fixes the problem that you missed out on long task info if you first navigate to a URL to fill the cache and then measure the next URL [#940](https://github.com/sitespeedio/browsertime/pull/940).

## 6.0.0 - 2019-09-10

### Added

* Limited support to run Safari on iOS and OS X. To run on iOS you need iOS 13 and Mac OS Catalina. At the moment you get Navigation Timing and Resource Timing metrics. In the future lets hope we can add more metrics [#872](https://github.com/sitespeedio/browsertime/pull/872).
* Collect element timings for Chrome [#921](https://github.com/sitespeedio/browsertime/pull/921). All elements needs to have a unique identifier for this to work correctly.
* Upgraded to Ubuntu Disco in the Docker container [#908](https://github.com/sitespeedio/browsertime/pull/908).
* Use Chromedriver 77 and Chrome 77.
* Use [TSProxy](https://github.com/WPO-Foundation/tsproxy) to throttle the connection. You should use TSProxy when you run on Kubernetes. Use it by `--connectivity.engine tsproxy`. We used to have support years ago but it never worked good on Mac/Linux so we dropped it. But it works better now so we added it back [#891](https://github.com/sitespeedio/browsertime/pull/891).
* Using Chrome 77 (or later) you will now get a layout shift score (in percentage), see https://web.dev/layout-instability-api. [#905](https://github.com/sitespeedio/browsertime/pull/905).
* Get LargestContentfulPaint in Chrome 77 (or later) [#906](https://github.com/sitespeedio/browsertime/pull/906).
* You can now add your own metrics directly from your script (or post script) using *context.result.extras*. More info coming [#917](https://github.com/sitespeedio/browsertime/pull/917)
* There's an alternative to collect Visual Metrics using the Chrome trace log, using [SpeedLine](https://github.com/paulirish/speedline) implemented in [#876](https://github.com/sitespeedio/browsertime/pull/876). Using video give more accurate metrics (at least in our testing) but maybe it could help running on Chrome on Android and add less overhead than recording a video. You can enable it with:  `--cpu --chrome.visualMetricsUsingTrace --chrome.enableTraceScreenshots`

### Changed
* Upgraded to yargs 14.1.0 that deep merge configuration files when you extend another configuration [#938](https://github.com/sitespeedio/browsertime/pull/938)
* We changed where the filmstrip screenshots are saved. Before it was *video/images*, now it is *filmstrip* both for VisualMetrics and SpeedLine [#876](https://github.com/sitespeedio/browsertime/pull/876).

### Fixed
* Added guard against when LCP miss out on a element [#936](https://github.com/sitespeedio/browsertime/pull/936).
* Make sure we have that page in the HAR before we try to add meta data [#937](https://github.com/sitespeedio/browsertime/pull/937).
* Increase margin from 4 -> 6% of for the bottom part of the screen to elimanate Chromes info bar on emulated mobile [#935](https://github.com/sitespeedio/browsertime/pull/935)
* Categorise all mime types that has JSON as JSON for Chrome (to make it possible to store the JSON result in the HAR) [#930](https://github.com/sitespeedio/browsertime/pull/930).
* Guard against Safaris limited PerformanceObserver [#922](https://github.com/sitespeedio/browsertime/pull/922).
* Removed decimals from FullyLoaded metric [#923](https://github.com/sitespeedio/browsertime/pull/923).
* Avoid using OS tmp dir (we have had people reporting permission errors) [#916](https://github.com/sitespeedio/browsertime/pull/916).

### Tech
* Updated dev dependencies and yargs, chrome-remote-interface, throttle, execa & sharp.

## 5.7.3 - 2019-08-03
### Fixed
* Fixed bug introduced in 5.6.0 that made it impossible to set multiple cookies when using Chrome [#910](https://github.com/sitespeedio/browsertime/pull/910).

## 5.7.2 - 2019-08-01
### Fixed
* If the trace log miss out on a navigationStart event (causing Tracium to fail) we now insert a navigationStart event [#904](https://github.com/sitespeedio/browsertime/pull/904). The missing navigationStart event started to happen more frequently in Chrome 76.

## 5.7.1 - 2019-07-31
### Fixed
* New Chrome introduced more errors when parsing the trace log [#902](https://github.com/sitespeedio/browsertime/issues/902). Let us log better if we have problems with the trace [#903](https://github.com/sitespeedio/browsertime/pull/903).

## 5.7.0 - 2019-07-30
### Added
* Upgraded to Chrome 76 in the Docker container and to Chromedriver 76.

## 5.6.1 -  2019-07-28
### Fixed
* There was a bug in getting the HTML/response bodies in Chrome where we didn't waited to get the content until we moved on [#900](https://github.com/sitespeedio/browsertime/pull/900).

## 5.6.0 -  2019-07-27
### Fixed
* Turn off visual metrics in the Docker container with `--visualMetrics false` didn't work. Fixed in [#881](https://github.com/sitespeedio/browsertime/pull/881).
* Getting the HTML in the HAR file didn't work correctly in Chrome, fixed in [#895](https://github.com/sitespeedio/browsertime/pull/895) and reported in [#894](https://github.com/sitespeedio/browsertime/issues/894).
* Moved all Browsertime Extension functionality for Chrome to CDP (to make this work on Android). On Desktop this should work as before:
    * Clear cache [#885](https://github.com/sitespeedio/browsertime/pull/885) and [#887](https://github.com/sitespeedio/browsertime/pull/887)
    * Block domains [#884](https://github.com/sitespeedio/browsertime/pull/884).
    * Set cookie [#883](https://github.com/sitespeedio/browsertime/pull/883) (the cookie is set on the domain under test).
    * Basic Auth [#882](https://github.com/sitespeedio/browsertime/pull/882).
* Added more verbose log to measure time to parse the Chrome trace log using Tracium [#890](https://github.com/sitespeedio/browsertime/pull/890) to make it easier to find performance issues.
* Bumped lodash from 4.17.11 to 4.17.15.
* Updated dependencies: chrome-har, execa, dayjs, find-up, yargs [#892](https://github.com/sitespeedio/browsertime/pull/892)

### Added
* You can use `--chrome.includeResponseBodies all` to get JS/CSS and other text bases response bodies included in the HAR file for Chrome [#896](https://github.com/sitespeedio/browsertime/pull/896).

* If you use Chrome and collect performance metrics using CDP (that is on by default) we now also collect First Meaningful Paint [#898](https://github.com/sitespeedio/browsertime/pull/898)

## 5.5.0 - 2019-07-11
### Added
* Updated to Firefox 68 in Docker.

### Fixed
* We seen cases where Firefox returns negative values for timeToFirstInteractive, we catch that with [#880](https://github.com/sitespeedio/browsertime/pull/880).
#882
## 5.4.1 - 2019-07-04#883
### Fixed
* Better check that a request header is supplied before parsing [#875](https://github.com/sitespeedio/browsertime/pull/875).

## 5.4.0 - 2019-07-04
### Fixed
* Better error message for the user if the config.json file is malformed [#869](https://github.com/sitespeedio/browsertime/pull/869)
* Getting the netlog for Chrome was broken when using scripting. This fix catches an error and changes when we remove the file. If you test multiple URLs the netlog will contain all interactions for the script. The first file = first URL. The second file = first and second url. [#874](https://github.com/sitespeedio/browsertime/pull/874)

### Added
* Two new functions in scripting: `addText.byName(name)` and `addText.byClassName(className)`. See [#870](https://github.com/sitespeedio/browsertime/pull/870).
* Upgraded to coming Selenium 4. There should be no difference for end users [#871](https://github.com/sitespeedio/browsertime/pull/871).

## 5.3.1 - 2019-06-30
### Fixed
* Updated Tracium with another way to find start navigation.

## 5.3.0 - 2019-06-29
### Added
* Added support for `--injectJs` using Chrome [#864](https://github.com/sitespeedio/browsertime/pull/864).

### Fixed
* Use CDP to set request headers for Chrome (instead of the Browsertime extension). This enables adding extra headers for Chrome on Android and fixes [#2520](https://github.com/sitespeedio/sitespeed.io/issues/2520). Fixed in [#867](https://github.com/sitespeedio/browsertime/pull/867).

##  5.2.6 - 2019-06-15
### Fixed
* Catch if getting the HTML for a resource from Chrome fails [#861](https://github.com/sitespeedio/browsertime/pull/861).
* A couple of more pixels to know if a orange screen is orange in Visual Metrics [#862](https://github.com/sitespeedio/browsertime/pull/862).
* Bumped versions if adbkit, chrome-remote-interface & yargs [#863](https://github.com/sitespeedio/browsertime/pull/863).

## 5.2.5 - 2019-06-13
### Fixed
* Fixed so that the tracing in Chrome ends before we start to run our JavaScript metrics (so that they aren't picked up in the trace) [#860](https://github.com/sitespeedio/browsertime/pull/860).

## 5.2.4 - 2019-06-13
### Fixed
* Running a script that started to measure without a URL and used an alias instead missed out on starting some browser services, for example Long Tasks in Chrome was not recorded. That is fixed in [#858](https://github.com/sitespeedio/browsertime/pull/858)

## 5.2.3 - 2019-06-12
### Fixed
* The --enableTraceScreenshots should also work under --chrome.enableTraceScreenshots.
* Updated Tracium to catch error that happens running tests on Wikipedia.
t,
## 5.2.2 - 2019-06-11
### Fixed
* For a while we will run our own version of Tracium that doesn't throw errors if the events in the trace log doesn't follow Traciums standard [#856](https://github.com/sitespeedio/browsertime/pull/856).

## 5.2.1 - 2019-06-10
### Fixed
* Next version of Chrome brings back the infobar that pushes down content see [upstream](https://bugs.chromium.org/p/chromium/issues/detail?id=818483). Lets remove the automated flag and test how that works [#853](https://github.com/sitespeedio/browsertime/pull/853).

* Include the last 50 pixels when checking if the page is still orange, hopefully fixing the case where First Visual Change happens way too early [#854](https://github.com/sitespeedio/browsertime/pull/854).

## 5.2.0 - 2019-06-07
### Added
* Added metric LastMeaningfulPaint that will be there when you collect `--visualElements` [848](https://github.com/sitespeedio/browsertime/pull/848).

* You can get screenshots in your Chrome trace log using `--chrome.enableTraceScreenshots` [#851](https://github.com/sitespeedio/browsertime/pull/851)

* Chrome 75 in the Docker container (and Chromedriver 75). Also updated Firefox to 67.0.1 [#852](https://github.com/sitespeedio/browsertime/pull/852).

### Fixed
* Fixed the missing timings in the trace log in Chrome. Or rather they where there but you couldn't see them when you drag/drop the log into devtools [#850](https://github.com/sitespeedio/browsertime/pull/850).

## 5.1.3 - 2019-05-31
### Fixed
* Upgraded DayJS to 1.8.14
* Use unmodified Selenium and use CDP outside of Selenium to avoid having our own modified version [#846](https://github.com/sitespeedio/browsertime/pull/846). People have had problem installing the npm package [#2483](https://github.com/sitespeedio/sitespeed.io/issues/2483) and this hopefully fixes that.

## 5.1.2 - 2019-05-29

### Fixed
* Using CPU metrics on Android phones was broken since 5.0.0, fixed in [#844](https://github.com/sitespeedio/browsertime/pull/844).

## 5.1.1 - 2019-05-27

### Fixed
* Getting the HTML content into your Chrome HAR included the full content object instead of just the plain text. Fixed in [#842](https://github.com/sitespeedio/browsertime/pull/842).

## 5.1.0 - 2019-05-27

### Added
* Updated the Docker container to use Firefox 67.0.
* Automatically pickup up visual mettrics for elements with the elementtiming attribute. When it land in Chrome, this will make sure you will get it both in RUM and synthetic [#841](https://github.com/sitespeedio/browsertime/pull/841)

## 5.0.0 - 2019-05-16

### Changed
* Replaced [Chrome-trace](https://github.com/sitespeedio/chrome-trace) with [Tracium](https://github.com/aslushnikov/tracium) in [#816](https://github.com/sitespeedio/browsertime/pull/816/). This means we use a Chrome blessed parser that will mean less work for us within the team! Enable it with `--chrome.timeline`. It also means two changes:
 * We skipped reporting all internal events inside of Chrome and only report events that takes more than 10 ms. We do this because it makes it easier to understand which events actually takes time and are useful.
 * Instead of reporting: Loading, Painting, Rendering, Scripting and Other we now report the same categories as Tracium: parseHTML, styleLayout, paintCompositeRender, scriptParseCompile,  scriptEvaluation, garbageCollection and other. This gives you a little more insights of CPU time spent.
 * We collect more trace log than before (following Lighthouse, the trace log will be larger on disk), this makes it easier for you when you want to debug problems.

## Added
* Collect CPU long tasks in Chrome using `--chrome.collectLongTasks` using the [Long Task API](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API). For the long tasks to work, we inject JS using the *Page.addScriptToEvaluateOnNewDocument* devtools command. We collect all long tasks and related data (not so much at the moment but will get better/more useful information when browsers supports it) and count the total number of long tasks, long tasks that happens before first paint and first contentful paint. Implemented in [#821](https://github.com/sitespeedio/browsertime/pull/821) and [#825](https://github.com/sitespeedio/browsertime/pull/825).

* By default a long task is >50ms. Wanna change that? Use `--minLongTaskLength` to set that yourselves (it needs to be larger than 50 ms though) [#838](https://github.com/sitespeedio/browsertime/pull/838).

* Throttle the CPU using Chrome with `--chrome.CPUThrottlingRate`. Enables CPU throttling to emulate slow CPUs. Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc). Implemented in [#819](https://github.com/sitespeedio/browsertime/pull/819).

* You can now use a .browsertime.json file as a default config json file that will be picked up automatically [#824](https://github.com/sitespeedio/browsertime/pull/824).

* Include the actual HTML in the HAR file for Chrome using `--chrome.includeResponseBodies html` [#826](https://github.com/sitespeedio/browsertime/pull/826)

* Use `--blockDomainsExcept` to block all domains except. Use it muliple times to have multiple domains. You can also use wildcard like *.sitespeed.io [#840](https://github.com/sitespeedio/browsertime/pull/840)

* Shortcut `--cpu` to enable `--chrome.timeline` and `--chrome.collectLongTasks` for Chrome [#839](https://github.com/sitespeedio/browsertime/pull/839).

### Fixed
* Bumped all dependencies that needed a bump [#817](https://github.com/sitespeedio/browsertime/pull/817).

## 4.9.3 - 2019-05-05
### Fixed
* Upgraded the Docker container to use Firefox 66.0.4 that fixes the extension problems that broke getting the HAR.

## 4.9.2 - 2019-04-26
### Fixed
* Upgraded to Chrome-trace 0.2.2 that hopefully fixes the miss matched thread ids that happens for some URLs.

## 4.9.1 - 2019-04-24
### Fixed
* The shrinkwrap file was broken with errors for the latest Chromedriver.

## 4.9.0 - 2019-04-24
### Added
* Chrome 74 in the Docker container and Chromedriver 74.

## 4.8.0 - 2019-04-23

### Added
* Scripting throws error with an exact error message of what went wrong instead of the wrapped Chromedriver error. The error is also added to the error array in the output json so you can see what goes wrong [#815](https://github.com/sitespeedio/browsertime/pull/815).

## 4.7.0 - 2019-04-21

### Added
* You can add your own errors in scripting with `commands.error(message)` [#813](https://github.com/sitespeedio/browsertime/pull/813).

* You can add a title and description to your script with `commands.meta.setTitle(title)` and `commands.meta.setDescription(desc)`  [#814](https://github.com/sitespeedio/browsertime/pull/814).

## 4.6.4 - 2019-04-16
### Fixed
* Bugfix: If a page failed, it was left out of the HAR file, making the flow broken if you used scripting [#812](https://github.com/sitespeedio/browsertime/pull/812).

## 4.6.3 - 2019-04-14
### Fixed
* Bugfix: If you test using a script and one of the URLs failed to load, the error was reported on wrong URL. Fixed in [#811](https://github.com/sitespeedio/browsertime/pull/811).

## 4.6.2 - 2019-04-09
* New release since npm had problem and broke the 4.6.1 release.

## 4.6.1 - 2019-04-09
### Fixed
* Remove Timestamp from CDP performance.
* Report duration metrics in CDP performance in ms.

## 4.6.0 - 2019-04-07

### Fixed
* The cli had wrong name for visualElements (was visuaElements). Fixed + alias to the old wrong one.

### Added
* Enable use of [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/). We now uses a modified version of Selenium that can use CDP. We also automatically collect the CDP performance metrics *Performance.getMetrics* (you can turn that off with `--chrome.cdp.performance false`). We also enabled raw use of the CDP in scripting: `cdp.sendAndGet(command, args)` and `cdp.send(command, args)` [#807](https://github.com/sitespeedio/browsertime/pull/807)

* Report loadEventEnd as a separate metric (you don't need to get it from the Navigation Timings section) [#808](https://github.com/sitespeedio/browsertime/pull/808).


## 4.5.3 - 2019-03-23

### Fixed

* Make sure you can test the same URLs within the same script. There are users that logs in and logs out the user on the same URL and that breakes since we use the URL to create all the files for that URL. This hack adds a incremental query parameter to the URL.[#805](https://github.com/sitespeedio/browsertime/pull/805).

## 4.5.2 - 2019-03-22

### Fixed

* Better logging if Visual Metrics fails. Add --verbose to see the output from Visual Metrics.

## 4.5.1 - 2019-03-22

### Fixed

* Recording visual metrics and clicking on links (the combination) was broken on Android phones as reported in [#802](https://github.com/sitespeedio/browsertime/issues/802) fixed in [#803](https://github.com/sitespeedio/browsertime/pull/803).

## 4.5.0 - 2019-03-19

### Added

* Use Chrome 73 in the Docker container (and latest Chromedriver)
* Use Firefox 66 in the Docker container.

## 4.4.9 - 2019-03-12

### Fixed

* Automatically catch if a user that uses a script misses calling measure.stop() [#798](https://github.com/sitespeedio/browsertime/pull/798).
* If a runs fail, make sure Browsertime fails more gracefully [#799](https://github.com/sitespeedio/browsertime/pull/799).

## 4.4.8 - 2019-03-04

### Fixed

* Add padding to video when using width/height not divisible by 2. Thank you [Ferdinand Holzer](https://github.com/fholzer) for the PR [#790](https://github.com/sitespeedio/browsertime/pull/790)
* Fixed broken delay time between runs (delay only worked when iterations > 2 and did not delay the last two runs) [#784](https://github.com/sitespeedio/browsertime/pull/784).

## 4.4.7 - 2019-02-21

### Fixed

* Use 15% fuzz (instead of 10%) when finding the last visual frame in Visual Metrics and allow 0 pixels difference [#786](https://github.com/sitespeedio/browsertime/pull/786)
* Added extra check so that we don't add metrics to the HAR if we failed to get metrics.

## 4.4.6 - 2019-02-19

### Fixed

* Multiple fixes to make sure that if a URL fails, we should add that error to the error array of the Browsertime json instead of just failing [#779](https://github.com/sitespeedio/browsertime/pull/779), [#781](https://github.com/sitespeedio/browsertime/pull/781) and [#782](https://github.com/sitespeedio/browsertime/pull/782).

* Fail fast if a user script can't be parsed [#783](https://github.com/sitespeedio/browsertime/pull/783).

## 4.4.5 - 2019-02-17

### Fixed

* Fine tuned and changed so 0.05 % (before it was 0.01%) of the pixels can differ when finding last visual change [#777](https://github.com/sitespeedio/browsertime/pull/777).

## 4.4.4 - 2019-02-15

### Fixed

* If a Visual Element wasn't found, we used to log that as an error, instead log as info [#775](https://github.com/sitespeedio/browsertime/pull/775).

## 4.4.3 - 2019-02-15

### Fixed

* Another go at fixing the flicker of the timer in the video [#773](https://github.com/sitespeedio/browsertime/pull/773). Thanks [ponyo877](https://github.com/ponyo877) for the PR.

* When trying to find the last visual change, a 0.01 % difference in pixels are now OK. We had problems finding too small difference that was picked up by Visual Metrics [#774](https://github.com/sitespeedio/browsertime/pull/774).

## 4.4.2 - 2019-02-14

### Fixed

* 4.4.1 introduced small flicker on the timer. [#772](https://github.com/sitespeedio/browsertime/pull/772) fixes that and change the look of the timer.

## 4.4.1 - 2019-02-13

### Fixed

* Print correct timestamp on the video [#770](https://github.com/sitespeedio/browsertime/pull/770) Thank you [ponyo877](https://github.com/ponyo877) for the fix!

## 4.4.0 - 2019-02-12

### Added

* There are two new cache clear commands: cache.clearKeepCookies() and cache.clear() (only working on Desktop) [#769](https://github.com/sitespeedio/browsertime/pull/769).

### Fixed

* Updated RUM Speed Index to include upstream fix [#766](https://github.com/sitespeedio/browsertime/pull/766).
* Make sure the body of the page is shown when setting the fullscreen to orange (when recording the video) [#767](https://github.com/sitespeedio/browsertime/pull/767)
* Testing redirect URLs was broken since 8.0. If you test a URL, use that URL and if you click on a link, usethe URL from the browser [#768](https://github.com/sitespeedio/browsertime/pull/768).

## 4.3.0 2019-02-10

### Added

* Add text by CSS selector (new command) addText.bySelector(text, selector) [#764](https://github.com/sitespeedio/browsertime/pull/764),

### Fixed

* click.byJs and click.byJsAndWait now uses JavaScript in backend instead of Selenium = will work on hidden links [#765](https://github.com/sitespeedio/browsertime/pull/765).

## 4.2.6 2019-02-08

### Fixed

* Command set value by id was broken, it used to set the value to the id [#761](https://github.com/sitespeedio/browsertime/pull/761).
* I've missed that for some URLs (as in this [login](https://github.com/sitespeedio/sitespeed.io/issues/2290#issuecomment-461601990) you could have an alias for an URL but the URL was actually slightly different. For example, you login to a site and the login step redirect to a URL and for that URL one value of a GET parameter differs. So with this fix we lock the alias tyo one specific URL. If your URL change and you use an alias, the first variation of the URL will be used [#763](https://github.com/sitespeedio/browsertime/pull/763).

## 4.2.5 - 2019-02-06

### Fixed

* Inserting metrics into the HAR file calculated the wrong page number if you tested multiple pages [#760](https://github.com/sitespeedio/browsertime/pull/760).

## 4.2.4 - 2019-02-04

### Fixed

* Commnad set.innerHtml was broken and click by xpath could not handle "-signs [#759](https://github.com/sitespeedio/browsertime/pull/759).

## 4.2.3 - 2019-02-04

### Fixed

* Rollbacked the the tmp dirs for Visual Metrics [#758](https://github.com/sitespeedio/browsertime/pull/758).

## 4.2.2 - 2019-02-04

### Fixed

* The HAR file had wrong visual metrics as reported in [#754](https://github.com/sitespeedio/browsertime/issues/754). Fixed in [#756](https://github.com/sitespeedio/browsertime/pull/756).

* Fixed borders when running Visual Metrics to try to avoid small orange in the first frame for Chrome [#755](https://github.com/sitespeedio/browsertime/issues/755) fixed in [#757](https://github.com/sitespeedio/browsertime/pull/757).

## 4.2.1 - 2019-02-03

### Fixed

* Ooops, click.byClassName and click.byClassNameAndWait broke in 4.2.0 [#753](https://github.com/sitespeedio/browsertime/pull/753).

## 4.2.0 - 2019-02-03

### Fixed

* Fixed so that `js.run()` returns whatever it gets back so you can script and get whatever you need from your page [#749](https://github.com/sitespeedio/browsertime/pull/749).

### Added

* New help command **set** to set innerHtml, innerText and value of element. [#750](https://github.com/sitespeedio/browsertime/pull/750).
* Added click.bySelector and rewrote most of click methods to use plain JavaScript instead of Selenium (so it will work on hidden elements) [#751](https://github.com/sitespeedio/browsertime/pull/751).

## 4.1.0 - 2019-01-31

### Added

* Upgraded the Docker container to use Chrome 72 and Firefox 65
* Upgraded to Chromedriveer 2.45.0 [#743](https://github.com/sitespeedio/browsertime/pull/743).
* Upgraded to Geckkodriver 0.24.0 [#742](https://github.com/sitespeedio/browsertime/pull/742).
* Disable Firefox updates during testing [#741](https://github.com/sitespeedio/browsertime/pull/741).
* New command: `js.runAndWait('')` that makes it possible to run your own JavaScript, click a link and wait on page navigation [#747](https://github.com/sitespeedio/browsertime/pull/747).

## 4.0.5 - 2019-01-28

### Fixed

* Bugfix: In 4.0.3 upgrade of Visual Metrics removed a couple fixes that should be there [#740](https://github.com/sitespeedio/browsertime/pull/740).

## 4.0.4 - 2019-01-27

### Fixed

* Bugfix: The font in the video was to big when testing on mobile/emulated mobile in Chrome [#738](https://github.com/sitespeedio/browsertime/pull/738).

## 4.0.3 - 2019-01-24

### Fixed

* Bugfix: Calculating Visual Complete 85/95/99 was broken IF the complete process went backward (first hitting 85% and then going down to < than 85%). We used
  to always take the first metric over 85% and then stick to it. Now we choose the last time it breaks the 85/95/99% metric [#732](https://github.com/sitespeedio/browsertime/pull/732).

* We updated the Visual Metrics lib to use the latest upstream version. We haven't updated for a while and we had issues where [the progress was calculated wrong](https://github.com/sitespeedio/sitespeed.io/issues/2259#issuecomment-456878707) [#730](https://github.com/sitespeedio/browsertime/pull/730).

## 4.0.2 - 2019-01-22

### Fixed

* Clearing browser trace log (Chrome only) happend before we started the video instead of after the video [#727](https://github.com/sitespeedio/browsertime/pull/727).

## 4.0.1 - 2019-01-21

### Fixed

* Doing a script navigation before measuring one URL broke Visual Metrics, fixed in [#726](https://github.com/sitespeedio/browsertime/pull/726).

## 4.0.0 - 2019-01-21

### Fixed

* Firefox proxy port not being set properly. Thank you [dpalmeiro](https://github.com/dpalmeiro) for the fix and PR
  [#702](https://github.com/sitespeedio/browsertime/pull/702).
* Disable dev-shm by default for Chrome [#697](https://github.com/sitespeedio/browsertime/pull/697), thank you [Vitalii Tverdokhlib](https://github.com/vitaliytv) for the PR. Docs will be updated when we release next stable.
* Fixed broken boolean preference for Firefox, thank you [@dpalmeiro)](https://github.com/dpalmeiro) for the fix [#683](https://github.com/sitespeedio/browsertime/pull/683).

### Added

* Added support for `--spa` configuration that will: Automatically use hash/params in file names and wait X seconds for no request in resource timing api as pageCompleteCheck [#700](https://github.com/sitespeedio/browsertime/pull/700) [#698](https://github.com/sitespeedio/browsertime/pull/698).
* Support for coming timeToContentfulPaint in Firefox (Nigthly at the moment) [#675](https://github.com/sitespeedio/browsertime/pull/675).
* Upgraded to Chrome-HAR 0.9.1.
* Updated Chrome to 71 and Firefox 64 in the Docker container.
* Updated to Chromedriver 2.44.
* Support for navigating by script. More docs on the way [#666](https://github.com/sitespeedio/browsertime/pull/666).
* Support for testing multiple pages [#685](https://github.com/sitespeedio/browsertime/pull/685) with using a navigation script. [Read the documentation](https://github.com/sitespeedio/browsertime#navigate-in-a-script-in-40-or-later).
* Upgraded to newer version of installers of Chromedriver and Geckodriver: less dependencies and the ability to skip installing drivers [#681](https://github.com/sitespeedio/browsertime/pull/681).
* It's now easier if you want to run stable Chrome on Android. Just add --android (and make sure you started ADB) instead of setting application name and disable xvfb [#688](https://github.com/sitespeedio/browsertime/pull/688).
* New switch command to switch to other frames/windows [#721](https://github.com/sitespeedio/browsertime/pull/721) [#723](https://github.com/sitespeedio/browsertime/pull/723).
* Added --videoParams.debug to get a video of a full iteration (all pre/post and script/URLs) [#722](https://github.com/sitespeedio/browsertime/pull/722).
* Get the Fully Loaded metric from the HAR instead of the Resource Timing API [#720](https://github.com/sitespeedio/browsertime/pull/720).

### Changed

* All data files (videos/screenshots etc) follows the pattern of sitespeed.io and are stored in a folder strucure from the page URL[#694](https://github.com/sitespeedio/browsertime/pull/694). The files are referenced in the browsertime.json. If you just want to test one URL at each time, you can keep the old structure with `--useSameDir`.

Read about [what has changed in 4.0](https://github.com/sitespeedio/browsertime#upgrade-from-3x-to-40).

* New default trace categories for chrome.timeline: `-*,devtools.timeline -> -, devtools.timeline, disabled-by-default-devtools.timeline, disabled-by-default-devtools.timeline.stack` [#677](https://github.com/sitespeedio/browsertime/pull/677) and [#679](https://github.com/sitespeedio/browsertime/pull/679).

* With the support of testing multiple pages, the structure of the result has changed (sorry there was no way avoiding that). The old structure of the result looked like:

```
{
"info": {
    "browsertime": {
        "version": "3.0.0"
    }, ...
```

And the new one returns a array, where each tested page is an result in that array.

```
[{
"info": {
    "browsertime": {
        "version": "3.0.0"
    }, ...
}]
```

That means JSON consumers needs to change the code, even if you only test one page.

The naming of videos, screenshots and trace logs has changed to include page number.

* We removed pre/post scripts becasue now you can just run them without any extra parameters. You can now run your script like this:`browsertime preScript.js https://www.sitespeed.io postScript.js`. At the same time we added support for testing multiple pages after each other: `browsertime https://www.sitespeed.io https://www.sitespeed.io/documentation/` where the browser will stay open between the two different pages [#690](https://github.com/sitespeedio/browsertime/pull/690).

* Changing default screen size from 1200x960 to 1366x768 [#691](https://github.com/sitespeedio/browsertime/pull/691).

### Tech

* Updated all old dependencies [#682](https://github.com/sitespeedio/browsertime/pull/682) and [#678](https://github.com/sitespeedio/browsertime/pull/678).

### Known bugs

* --videoParams.combine isn't implemented for the current version (yet).

## 3.12.1

### Fixed

* Updated Docker to use latest Firefox and Chrome to avoid using the update me popup in Firefox.

## 3.12.0

### Added

* Add `--verbose` and Visual Metrics will log to a log file in the video dir (that makes it easier for people that report bugs) [#662](https://github.com/sitespeedio/browsertime/pull/662).

* Disable GPU for Chrome when running with xvfb [#659](https://github.com/sitespeedio/browsertime/pull/659).

* Get Server Timings [#657](https://github.com/sitespeedio/browsertime/pull/657). This works fine in Chrome and should(?) work in Firefox but I cannot get it to work. I'll create an upstream issue when I get the time.#

* Support Firefox timeToFirstInteractive [#656](https://github.com/sitespeedio/browsertime/pull/656). This is Firefox Nightly at the moment, try it on an Mac with: `browsertime --firefox.nightly https://www.wikipedia.org -n 1`. At the moment it looks like the metric takes some time for Firefox to calculate so we end the test before it is finished. You can try it out with changing `--pageCompleteCheck`.

* Chrome on Android has a different CLI args setup [#668](https://github.com/sitespeedio/browsertime/pull/668).

### Fixed

* We changed how we remove the orange frames from the video when you collect visual metrics. In the old version we used ffprobe to find the start point. That sometimes made us inlcude the orange frame in the videos (it was broken when running on Android). We now get the value from VisualMetrics directly and tune the video in two steps: First remove the orange frames and then add the text [#665](https://github.com/sitespeedio/browsertime/pull/665).

* Running in Docker we always tried to do a hard kill on FFMPEG, but we onlyu need that on Docker desktop [#670](https://github.com/sitespeedio/browsertime/pull/670).

* Fixed how we go from orange to white on an Android phone, by always making the screen orange and then unload it to white. This makes the visual metrics match the video [#672](https://github.com/sitespeedio/browsertime/pull/672).

* If you run on ARM we just skip installing the Chromedriver instead of just hanging ...

### Tech

* Changed from moment to DayJS [#667](https://github.com/sitespeedio/browsertime/pull/667).

* Moved the logging of options from the CLI to the engine (using verbose) so you always have the ability to log the options [#671](https://github.com/sitespeedio/browsertime/pull/671).

## 3.11.1

### Fixed

* Removing --startwhite in Visual Metrics introduced higher deviation in metrics for Chrome [#655](https://github.com/sitespeedio/browsertime/issues/655).

## 3.11.0

### Added

* Using Firefox 63 in the Docker container.

## 3.10.0

### Added

* Chromedriver 2.43.0

### Fixed

* Fixes the bug when you try to set the cookie but it is cleared by --cacheClearRaw. See [#13](https://github.com/sitespeedio/browsertime-extension/pull/13). And thank you [Omri](https://github.com/omrilotan) for the PR!

## 3.9.0

### Added

* Upgraded to Chrome 70 in the Docker file.
* Upgraded to latest Chrome trace to support new trace in Chrome 70.

## 3.8.2

### Fixed

* The orange screen for Firefox was broken in 3.8.0 and in 3.8.1. Let me make it work in both Chrome and FF [#651](https://github.com/sitespeedio/browsertime/pull/651).

## 3.8.1 - 2018-10-15

### Fixed

* In 3.8.0 Firefox visual metrics was broken if you use the Browsertime extension (the first visual change was higher than it should). The problem was that orange div (that is used for video) didn't work with perfectly with the extension server [#649](https://github.com/sitespeedio/browsertime/pull/649).

## 3.8.0 - 2018-10-15

### Added

* The `--pageCompleteCheck` now accepts an inline JavaScript (for backward compatibility) or a path to a javascript file (enhancement request). Thank you [Don Walling](https://github.com/donwalling) for the [PR](https://github.com/sitespeedio/browsertime/pull/646).

### Fixed

* Updated to latest Chrome-har (0.5.0) that pickup navigations within the page.
* Fixes for video: Make sure the layer of orange is full screen. Remove the layer instead of making it white and make sure visual metrics doesn't need to start white. All these three fixes helps us test pages in a flow of URLs. [#648](https://github.com/sitespeedio/browsertime/pull/648). This will change the look and feel of he video when you test with --preURL: instead of starting white, it will start preURL content on the screen. The metrics will be the same, the video will look different.
* Upstream fixes of Visual Metrics, choosing max size of content widths to skip Chromes requests info [#645](https://github.com/sitespeedio/browsertime/pull/645/).

## 3.7.2 - 2018-10-10

### Fixed

* We had a check that FF is 61 or later for the HAR export trigger to work. However that fix makes sitespeed.io break when you run with mobile options, see https://github.com/sitespeedio/sitespeed.io/issues/2178#issuecomment-428638659. It also makes Firefox tests to break as long as you set a different user agent. We are now on FF 62 so we can just remove the check.

## 3.7.1 - 2018-10-05

### Fixed

* Upgraded to Geckodriver 0.23.0
* Upgraded to NodeJS 8.12.0 in the Docker container.

## 3.7.0 - 2018-10-02

### Tech

* Cleanup of the Visual Elements script [#641](https://github.com/sitespeedio/browsertime/pull/641).

### Added

* Automatically add all visual elements to the HAR timings (so you can see them in PerfCascade) [#642](https://github.com/sitespeedio/browsertime/pull/642).

* You can run your own JavaScript in Firefox that will be executed on document_start. Use --injectJs [#643](https://github.com/sitespeedio/browsertime/pull/643).

### Fixed

* Upgrading to a new version of the Browsertime extension that sets a request header for basic auth instead of using internal WebExtension code [#643](https://github.com/sitespeedio/browsertime/pull/643). See [Bug #2151](https://github.com/sitespeedio/sitespeed.io/issues/2151).

## 3.6.0 - 2018-09-24

### Added

* Turned on the Firefox only metric: timeToDomContentFlushed [#637](https://github.com/sitespeedio/browsertime/pull/637).
* Pick up stddev for all metrics [#638](https://github.com/sitespeedio/browsertime/pull/638).

### Fixed

* If a visualElement is missing, we log the error instead of throwing it [#639](https://github.com/sitespeedio/browsertime/pull/639).

## 3.5.0 - 2018-09-15

### Added

* We support timings for visual elements (by adding `--visuaElements`). Browsertime picks up the largest image and the largest H1. You can also configure your own elements `--scriptInput.visualElements`. First let give creds to the ones that deserves it: As far as we know [Sergey Chernyshev](https://twitter.com/sergeyche) was the first one that introduced the idea of measuring individual elements in his talk [Using Heat Maps to improve Web Performance Metrics](https://www.youtube.com/watch?v=t6l9U5bC8jA). A couple of years later this was implemented by the people behind [SpeedCurve](https://speedcurve.com/), that later on contributed back the implementation to WebPageTest (calling it "hero"-elements). [Patrick Meenan](https://twitter.com/patmeenan) (the creator of WebPageTest) moved on the implementation to [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics) that Browsertime uses to pickup visual metrics from the video. We tuned the implementation a little and now it is ready to release.

* We also added a new feature: If you run your own custom script you can now feed it with different input by using `--scriptInput.*`. Say you have a script named myScript you can pass on data to it with `--scriptInput.myScript 'super-secret-string'`. More about this in the documentation the coming weeks.

* Upgraded to Chromedriver 2.42.0

### Fixed

* In some cases Chrome returns an empty HAR and that made us throw an error. This make sure the HAR has a page before we use it [#630](https://github.com/sitespeedio/browsertime/pull/630).

## 3.4.1 - 2018-09-13

### Fixed

* Tech: We unified how we change the background color from orange to white when we record the video (to be able to know when the navigation start) [PR 634](https://github.com/sitespeedio/browsertime/pull/634).

## 3.4.0 - 2018-09-13

### Added

* Upgraded to Chromedriver 2.41.0.
* Upgraded to Chrome 69 and Firefox 62 in the Docker container.

### Fixed

* There been several [reports on bugs](https://github.com/sitespeedio/sitespeed.io/issues/1949) when using a preScript to login and then measure a page. The problem has been how we find the first frame + a bug that didn't make the video with orange frames between different pages. Thats been fixed now in [#633](https://github.com/sitespeedio/browsertime/pull/633).

## 3.3.1 - 2018-08-09

### Fixed

* Tech: Browsertime now logs under the browsertime name and we unified the log format to be the same as sitespeed.io. Add --verbose to log by name (useful for running Browsertime in sitespeed.io) and log the pageComplete check JavaScript only in debug mode (instead of verbose).

## 3.3.0 - 2018-07-29

### Added

* Updated to Chrome 68 in the Docker container.

### Fixed

* Added extra check for not use full time out if you navigate to the same URL [#625](https://github.com/sitespeedio/browsertime/pull/625).

## 3.2.3 - 2018-07-20

### Fixed

* Increase timeout to wait for page navigation. Before it was 5s, now it is 50s [#623](https://github.com/sitespeedio/browsertime/pull/623).

## 3.2.2 - 2018-07-20

### Fixed

* If you configured to not keep the video, there was a miss-match when removing the video (we also tried to remove the screenshot dir), so you got an error in the log. That is fixed by [#621](https://github.com/sitespeedio/browsertime/pull/621).

## 3.2.1 - 2018-07-14

### Fixed

* Handle . (dot) in userTiming names [#618](https://github.com/sitespeedio/browsertime/pull/618).
* You can now add multiple cookies by adding --cookie multiple times [#619](https://github.com/sitespeedio/browsertime/pull/619).
* Updated the [Browsertime extension](https://github.com/sitespeedio/browsertime-extension) to 0.13.0. The new version takes care of the difference on how Firefox and Chrome implements the API. In the old version, clearing the cache with --cacheClearRaw throwed an error. That is fixed now.

## 3.2.0 - 2018-06-30

### Fixed

* The Browsertime-extension was broken in Firefox, probably since there was a change in extension handling in FF 55 and effecting us in FF 61.

### Added

* You can now easy add a cookie. At the moment we only support one cookie but let us fix that after the summer holiday `--cookie name=value`

## 3.1.4 - 2018-06-25

### Fixed

* Upgraded to Geckodriver 0.21.0 https://github.com/mozilla/geckodriver/releases/tag/v0.21.0
* The Docker container uses Firefox 61 stable.

## 3.1.3 - 2018-06-14

### Fixed

* You can now set the device serial if you run multiple devices to reverse the traffic when you run Android devices from Ubuntu. Set -e DEVICE_SERIAL=PHONE_ID. If you run this before, the reverse of tcp failed.
* We now clear the console log before testing (in Chrome) [#611](https://github.com/sitespeedio/browsertime/pull/611).
* We fixed so that you can collect the netlog in Chrome even though you turn off getting the HAR [#612](https://github.com/sitespeedio/browsertime/pull/612).

## 3.1.2 - 2018-06-12

### Fixed

* Upgraded Chromedriver to 2.40.0.
* Upgraded ADB in the Docker container work with Chromedriver > 2.39 fixing problems running on Docker Ubuntu driving Chrome on Android.
* Upgraded Firefox 61 to beta 13 (form beta 5) in Docker.

## 3.1.1 - 2018-06-01

### Fixed

* Updated Chrome-HAR to 0.4.1 to be extra careful when we check for pushed responses.

## 3.1.0 - 2018-06-01

### Added

* Upgraded to Chromedriver 2.39
* Upgraded to Chrome 67

### Fixed

* We reverted the change of using pageLoadStrategy _none_ as default (we now use normal as we done since day 1). This means it is easier for users that uses pre/post script = you will get control when the page has finished loading instead of when navigation starts. You can still use the none option by adding `--pageLoadStrategy none` to your run (that is useful if you want to end your tests earlier).

## 3.0.16 - 2018-05-30

### Fixes

* Fixing setting ifb0 twice in Throttle.

## 3.0.15 - 2018-05-30

### Fixes

* Another go trying to fix Throttle in Docker for multiple URLs.

## 3.0.14 - 2018-05-30

### Fixes

* Upgraded Throttle to 0.4.0 to hopefully fix https://github.com/sitespeedio/sitespeed.io/issues/2063
* Upgrade to chrome-har 0.4.0, with a fix for including HTTP/2 assets in HARs.

## 3.0.13 - 2018-05-23

### Fixes

* The current official version of the HAR Export Trigger doesn't work on 60 (you need 61). Let us not run the plugin on 60 [#603](https://github.com/sitespeedio/browsertime/pull/603).

## 3.0.12 - 2018-05-23

### Fixes

* Rollbacked the Firefox HAR export since the new version breaks support for FF 60 (I missed that) and the new HAR misses content fields.

## 3.0.11 - 2018-05-22

### Fixes

* In Docker with Firefox we now don't choose the netmonitor devtools tab, hopefully making less CPU impact when we collect the HAR [#598](https://github.com/sitespeedio/browsertime/pull/598).

## 3.0.10 - 2018-05-22

### Fixes

* npm ping issues making our packages not go out as they should, lets try it again. The problem is the npm registry https://github.com/npm/registry/issues/327

## 3.0.9 - 2018-05-22

### Fixes

* Another fix for making it possible to run on Android phones on SauceLabs: You can now use the Browsertime extension, for example --cacheClearRaw.

## 3.0.8 - 2018-05-21

### Fixed

* Using --android flag to disable setting the window size didn't work. You need to do that to run on real devices on SauceLabs. We don't recommend to do it, but we know people do that so we want to keep it working.

## 3.0.7 - 2018-05-18

### Fixed

* The original problem of https://github.com/sitespeedio/sitespeed.io/issues/2040 happens if we set an output dir and the mp4 file already exits when we tries to convert it. This fix removes the file if it exists before converting [#594](https://github.com/sitespeedio/browsertime/pull/594).

## 3.0.6 - 2018-05-18

### Fixed

* Use the stdin ignore flag when converting video files using FFMPEG, hopefully fixing freezing converts reported in https://github.com/sitespeedio/sitespeed.io/issues/2040 [#592](https://github.com/sitespeedio/browsertime/pull/592).

## 3.0.5 - 2018-05-17

### Fixed

* We upgraded our own build of the HAR Export trigger to use the official one [#589](https://github.com/sitespeedio/browsertime/pull/589).
* More solid solution to wait in navigation to start [#590](https://github.com/sitespeedio/browsertime/pull/590).
* Better logs to understand why convert the video sometimes fails/halts.

## 3.0.4 - 2018-05-16

### Fixed

* Updated Firefox 61b3 to Firefox 61b5
* Bugfix: Wait longer before Firefox has finished navigated see https://github.com/sitespeedio/sitespeed.io/issues/2040 fixed with [#584](https://github.com/sitespeedio/browsertime/pull/584).

## 3.0.3 - 2018-05-15

### Fixed

* Updated WebPageReplay with fix for "Improve replay determinism". Build 2018-05-14.
* Use -e to set which port to use for WebPageReplay in Docker. Use -e WPR_HTTP_PORT=X and -e WPR_HTTPS_PORT=Y
* Fixed broken license file for WPR.

## 3.0.2 - 2018-05-14

### Fixed

* Updated Docker dependencies so downloaded files are remove -> smaller Docker file. Thanks [@sodabrew](https://github.com/sodabrew) for the PRs.
* Another go at making WebPageReplay work with ADB (small fix)
* Browsertime + WebPageReplay returned an error code instead of 0 after a succesful run (Docker container only).

## 3.0.1 - 2018-05-12

### Fixed

* Removed chrome.loadTimes from RUMSpeedIndex to get rid of Chrome warnings.

## 3.0.0

We have worked a lot to make Browsertime 3.0 the best version so far. Read the [blog post](https://www.sitespeed.io/browsertime-3.0/) about the 3.0 release. And please read the [breaking changes](#breaking-change) before you update!

## Internal changes/developers

* We have removed the use of Bluebird Promises and now uses async/await and native Promises.
* In some cases we leaked Bluebird promises, this is changed to native promises.
* Running the engine took a promise that eventually became the scripts. Now you need to run with the scripts directly (no promises) to simplify the flow.

## Added

* We updated the browsers in the Docker container to Chrome 66 and latest Firefox 61 beta.
* You can now turn on the MOZ HTTP log for Firefox with `--firefox.collectMozLog` [#451](https://github.com/sitespeedio/browsertime/pull/451) see [https://developer.mozilla.org/en-US/docs/Mozilla/Debugging/HTTP_logging](https://developer.mozilla.org/en-US/docs/Mozilla/Debugging/HTTP_logging)
* Upgraded to new Browsertime extension with [support for web sockets](https://github.com/sitespeedio/browsertime-extension/issues/5).
* You can now choose niceness level for FFMPEG during a recording using `--videoParams.nice`. With this you can finetune the prio for the FFMPEG process.
* In the browsertime.json you now get errors in the errors array. This makes it possible for us to gracefully handle if one of the runs fails.
* You can now gzip the HAR file by adding `--gzipHar` to your run.
* Option to end test on 5s of inactivity [#574](https://github.com/sitespeedio/browsertime/pull/574). Do it by adding `--pageCompleteCheckInactivity`.
* Updated [Throttle](https://github.com/sitespeedio/throttle) to 0.3.
* You can now add a resultURL to the video/screenshots in the HAR.
* The netlog is now gzipped from Chrome.
* You can now install your own extension: [#552](https://github.com/sitespeedio/browsertime/pull/552).

## Fixed

* We now use the latest and greatest Visual Metrics [#542](https://github.com/sitespeedio/browsertime/pull/542) and always get the viewport, hopefully fixing the problem with last visual change that sometimes happens for emulated mobile.
* Updated Chrome-HAR that fixes problems in Chrome 66.
* New version of the trace parser (for CPU metrics) with updated feature list.
* Move video out of pre/post scripts. When we first started with the video we used the pre/post structure. That was ok to move fast but one of the negatives is that stopping the video happen after we collected all metrics. We now stop the video exactly when the the page is finished loading [#448](https://github.com/sitespeedio/browsertime/pull/448).
* In the browsretime.json mdev was never formatted, now we use 4 decimals (make the JSON more readable) [#453](https://github.com/sitespeedio/browsertime/pull/453).
* Modernized the JavaScript we use to collect the metrics, see [#457](https://github.com/sitespeedio/browsertime/pull/457).
* Fixed so that Chrome on Android can use the ExtensionServer (clear the cache, add request headers etc) [#470](https://github.com/sitespeedio/browsertime/issues/470).
* Better handling of Chrome emulated mobile: We now set the correct window size for phones [#528](https://github.com/sitespeedio/browsertime/pull/528)
* Errors is now an array of an array: one run can produce multiple errors.

### Changed

* Store the Chromedriver log in the result directory (before it was stored where you run Browsertime) [#452](https://github.com/sitespeedio/browsertime/pull/452).
* Metrics like first paint, resource timings and paint timings was reported with 8 decimals in worst cases. Reporting in full ms is ok [#455](https://github.com/sitespeedio/browsertime/pull/455).
* The video now ends on Last Visual Change + 1 s (before it could go on as long as the video was recorded).
* All Chrome trace files are now gzipped [#517](https://github.com/sitespeedio/browsertime/pull/517)
* Firefox preferences now uses mostly the same settings as Mozilla do in their performance tests [#524](https://github.com/sitespeedio/browsertime/pull/524).

### BREAKING CHANGE

* Store extra JSON and screenshots per run (and collect stats between runs). We want to make Browsertime as mean and clean as possible: Store all extra JSONs (chrome trace categories, console log and more), and the screenshots between runs (before they where stored on exit). This is good because it will decrease the memory impact but it is non backward compatible change! Sitespeed.io and other tools need to change how they handle extra JSONs and the screenshot. Browsertime users that uses browsertime from the command line will not see any change. We also moved most stats to be collected between runs, that is needed for CPU stats since we store the data and throws it away between runs [#449](https://github.com/sitespeedio/browsertime/pull/449).
* We disabled the old HAR Export trigger (max Firefox 54). And we now uses the new [https://github.com/devtools-html/har-export-trigger/](https://github.com/devtools-html/har-export-trigger/) that needs Firefox 60 or later to work.
* We renamed the options to get Visual Metrics to be `--visualMetrics` instead of --speedIndex. When we first introduced Visual Metrics Speed Index was more known, but it has always been a thorn in the side to call the option that. In Docker we collect Visual Metrics by default.
* We use [sharp](http://sharp.pixelplumbing.com/) to store/convert screenshots. Screenshots are now located in the screenshots folder, named after each run. Default are now jpg screenshots. [#468](https://github.com/sitespeedio/browsertime/pull/468). Checkout all the new `--screenshotParams` configurations.
* Remove deprecated (renamed) options experimental.dumpChromePerflog (use chrome.collectPerfLog) and chrome.dumpTraceCategoriesLog (use chrome.collectTracingEvents).
* Remove broken support for video recording on macOS (Docker on mac still works).
* Removed deprecated (renamed) option videoRaw. Always use `--videoParams.addTimer` (boolean) if you want to toggle timer/metrics in the video
* We now use pageLoadStrategy "none". That means if you run your own pageCompleteCheck you can now end your test whenever you want (before onLoad if you want) [#501](https://github.com/sitespeedio/browsertime/pull/501).
* We changed how we change between orange to white when we record a video. Depending on your machine, Selenium/WebDriver introduced latency the old way we did the switch [#503](https://github.com/sitespeedio/browsertime/pull/503).
* We removed collecting Resource Timing data as default [#505](https://github.com/sitespeedio/browsertime/pull/505). If you still need the metrics, you can still run the script: [https://github.com/sitespeedio/browsertime/blob/2.x/browserscripts/timings/resourceTimings.js](https://github.com/sitespeedio/browsertime/blob/2.x/browserscripts/timings/resourceTimings.js).
* You can now choose what kind of response bodies you want to store in your HAR file . Instead of using `--firefox.includeResponseBodies` to include all bodies you can now use `--firefox.includeResponseBodies` [none,all,html][#518](https://github.com/sitespeedio/browsertime/pull/518).
* We cleaned up how you collect trace logs from Chrome. If you want the devtools.timeline log (and CPU spent metrics), just use `--chrome.timeline`. If you want to configure trace categories yourself, use `--chrome.traceCategories`
* File names are now based on 1 and not 0 so the first file from the first iteration is named something with -1. [#536](https://github.com/sitespeedio/browsertime/pull/536).

## version 2.5.0 2018-04-07

### Fixed

* We rollbacked the HAR exporter to the one that works in FF 54 and will wait on FF 61 until we update. That means that the
  2.x branch and releases will stay locked to FF54 in the Docker file while we are working in Browsertime 3.0. The current way of
  using the new HAR exporter adds about 1 second overhead on our test pages on dasgboard.sitespeed.io.

* Upgraded Chrome-HAR with fixes for Chrome 66 and when network error happans.

## version 2.4.1 2018-04-05

### Fixed

* User Timing measurements was handled incorrect so they was never sent correctly to Graphite. Thanks [@knaos](https://github.com/knaos) for reporting and finding the issue.
* Firefox 60 vs 61 has changed what is returned by the HAR export trigger. We now handles both.

## version 2.4.0 2018-03-20

### Fixed

* Reverting fix for Chrome 65 disabling infobars. We use Chrome 66 now.

### Added

* Updated Docker to use Chrome 66 beta and FF 61 Nightly

## version 2.3.0 2018-03-16

### Added

* Updated to the new HAR Export plugin for Firefox, needs Firefox 60 to work (beta/nightly)
* Updated Docker container to use Chrome 65 and Firefox 60 (currently nightly, soon beta)
* If you run in verbose mode and the run fails, Browsertime will try to take a screenshot of the screen to make it esier to understand why it fails. Thanks [Vitaliy Honcharenko](https://github.com/vgoncharenko) for the PR! [#508](https://github.com/sitespeedio/browsertime/pull/508).

### Fixed

* Fixed better way to end the tests when running WebPageReplay [#460](https://github.com/sitespeedio/browsertime/issues/460).
* Do not try to replay if recording fails for WebPageReplay
* Default wait time is loadEventEnd + 5 s (before 2s) for WebPageReplay
* If recording or accessing the URL fails then do to replay for WebPageReplay
* Handle filenames with % for FFMPEG https://github.com/sitespeedio/sitespeed.io/issues/1911
* Updated to Chromedriver 2.36
* Updated to Geckodriver 0.20.0
* Updated to Chrome-har 0.3.0
* Added offset for video in Chrome 65 (that broken infobar) [#489](https://github.com/sitespeedio/browsertime/issues/489).
* Turn off OCSP request for Firefox when running WebPageReplay
* Parse --firefox.preferences values as Numbers if they are a number :)

## version 2.2.2 2018-02-22

### Fixed

* New version of the trace parser (for CPU metrics) with updated feature list.
* New updated Browsertime extension adding support for web sockets.

## version 2.2.1 2018-02-14

### Fixed

* Return missing promises when getting the console log.
* Use pre compiled version of WebPageReplay to minimise the size of the Docker container [#443](https://github.com/sitespeedio/browsertime/pull/443).

## version 2.2.0 2018-02-14

### Added

* You can now get more meaningful CPU metrics out of Chrome (both by category and per event type). Use it by adding --chrome.traceCategories devtools.timeline --chrome.collectTracingEvents --chrome.collectCPUMetrics. [#434](https://github.com/sitespeedio/browsertime/pull/434). We use [https://github.com/WPO-Foundation/trace-parser](https://github.com/WPO-Foundation/trace-parser) to parse the Chrome trace log.

* You can now get the Chrome console log by --chrome.collectConsoleLog. It will be written to disk (one file per run) [#345](https://github.com/sitespeedio/browsertime/pull/345).

### Fixed

* We increased the probesize again for FFMPEG [#441](https://github.com/sitespeedio/browsertime/pull/441), maybe it can help people running without setting connectivity and have video problems.

* Another go at fixing so that Chromedriver doesn't hang (sometimes) following https://github.com/SeleniumHQ/docker-selenium/issues/87 [#442](https://github.com/sitespeedio/browsertime/pull/442) in the Docker container.

## version 2.1.7 2018-01-25

### Fixed

* The start script in the Docker file handled parameters wrong. [#430](https://github.com/sitespeedio/browsertime/issues/430).

* Updated to Chrome 64 in the WebPageReplay Docker container.

## version 2.1.6 2018-01-24

### Fixed

* Another WebPageReplay bug: Setting correct ports for WebPageReplaying

## version 2.1.5 2018-01-24

### Fixed

* Replaying and ADB failed in the WebPageReplay Docker container (always trying to reply).

## version 2.1.4 2018-01-23

### Fixed

* You can now run WebPageReplay in the Docker container together with your Android phone.

* The WPR Docker is updated with Firefox 58.

* Updated to Chromedriver 2.35.0

## version 2.1.3 2018-01-10

### Fixed

* Removed chrome.loadTimes that will be deprecated in Chrome 64 [#417](https://github.com/sitespeedio/browsertime/issues/417). Instead use the paint timing API.

* We had introduced a problem with getting the trace log from Chrome that could make getting the log tiemout see [#420](https://github.com/sitespeedio/browsertime/issues/420), the original issue is a bug in Chromedriver 2.29+ see [#337](https://github.com/sitespeedio/browsertime/issues/337)

## version 2.1.2 2017-12-18

### Fixed

* Trap WebPageReplay so you can stop running it the command line (WebPageReplay Docker container).
* Updated to Chromedriver 2.34

## version 2.1.1 2017-12-13

### Fixed

* The new experimental alpha Docker container including WebPageReplay, wasn't working completely, updated version https://github.com/sitespeedio/browsertime#using-webpagereplay

## version 2.1.0 2017-12-12

### Added

* Upgrade to Chrome 63 in the default Dockerfile
* There's a new experimental Docker container including WebPageReplay, it's kind of a alpha feature and you can test it out if you want: https://github.com/sitespeedio/browsertime#using-webpagereplay

## version 2.0.1 2017-11-28

### Fixed

* Some Android phones video didn't work as we expected, having different values when analyzing the white background [#408](https://github.com/sitespeedio/browsertime/pull/408).

* Instead of hardcoded path to the sdcard for Android, we now fetch it dynamically [#409](https://github.com/sitespeedio/browsertime/pull/409).

### Internally

* We have started using await/async!

## version 2.0.0 2017-11-23

## IMPORTANT UPGRADE NOTICE

* We now use latest NodeJS 8.9, so you need to upgrade
* The default framerate for video is now 30, before it was 60. If you want to keep using 60, add `--videoParams.framerate 60`
* The default engine when you run in Docker is now "external" instead of tc, that means if you want to change the connectivity you need to do that with Docker networks or use the bundled Throttle engine. We also removed TSProxy and tc. Please use Docker networks or Throttle as engine.

### Added

* Recording videos is now done in two steps: First record as lossless as possible and then convert to a viewable format [#378](https://github.com/sitespeedio/browsertime/pull/378).
* Upgraded to Selenium 3.6 [#380](https://github.com/sitespeedio/browsertime/pull/380).
* You can now turn on/off the filmstrip screenshots (`--videoParams.createFilmstrip`), set the quality (`--videoParams.filmstripQuality`), and choose if you want them in full video size (`--videoParams.filmstripFullSize`) [#385](https://github.com/sitespeedio/browsertime/pull/385).
* It is now easy to run Firefox Nightly, Beta and Developer edition on Mac OS X. Just add `--firefox.nightly`, `--firefox.beta` or `--firefox.developer` to the cli (for Linux you need point out the location with `--firefox.binaryPath` [#384](https://github.com/sitespeedio/browsertime/pull/384)
* You can now configure which display number xvfb will use (default 99) [#389](https://github.com/sitespeedio/browsertime/pull/389).
* Automatically collect video and visual metrics in Docker.
* Setting default values for video parameters, making it easier to run Browsertime in NodeJS [#394](https://github.com/sitespeedio/browsertime/pull/394).
* Added configurable wait time (`--videoParams.androidVideoWaitTime` default is 5000 ms) for pulling the video from mobile to the server [#393](https://github.com/sitespeedio/browsertime/pull/393).
* You can now run Firefox against insecure certs `--firefox.acceptInsecureCerts` [#399](https://github.com/sitespeedio/browsertime/pull/399)
* Added TimeToNonBlank for Firefox.
* You can now create a video that includes what you run in preScript and postScript by `--videoParams.combine`
* Adding package-lock.json via node 8 for consistent dependency install

### Removed/changed

* We removed TSProxy and tc (sltc) as connectivity engines since none of them worked 100%. Instead user Docker networks or the new Throttle engine [#379](https://github.com/sitespeedio/browsertime/pull/379/). The default engine when you run in Docker is now external, before it was tc.

* The default framerate for video is now 30 (before 60). See `--videoParams.framerate`. We have done a lot of testing on C4.large on AWS and 60 fps adds too much overhead that makes metrics unstable.

* We upgraded to use NodeJS 8 and you should do that too.

### Fixed

* Always run the extension first, then prescripts [#395](https://github.com/sitespeedio/browsertime/pull/395).
* Tighten Firefox settings (calling home etc).
* Escape path names with = sign for FFProbe.

## version 1.9.5 2017-10-14

### Fixed

* Updated to Throttle 0.1.0 that fixes a bug so we get a promise when we set connectivity on localhost on Linux and always remove filters before setting new ones. Throttle is now more robust.

## version 1.9.4 2017-10-04

### Fixed

* Updated version of throttle that sets the correct delay on localhost (before the delay was \*2).
* Upgraded to Chromedriver 2.33.0 that fixes running Chrome > 61

## version 1.9.3 2017-09-29

### Fixed

* Updated version of throttle so that route runs with sudo.
* Removed the check for custom connectivity so you ca set just latency if that's what you want.

## version 1.9.2 2017-09-29

### Fixed

* Larger default bottom margin when calculating Visual Metrics [#375](https://github.com/sitespeedio/browsertime/issues/375).

## version 1.9.1 2017-09-29

### Fixed

* Fixed log check for missmatch between iterations and created pages.
* Upgaded Throttle with a bug fix so that the ingress filter is removed in Linux.

## version 1.9.0 2017-09-29

### Fixed

* Let VisualMetrics use the same bottom margin as WebaPageTest.
* Use Chromedriver 2.32.0
* Silence XVFB by default. Add -vv (or higher) to let XVFB send to default stderr.

### Added

* New way to throttle your connection using Throttle: https://github.com/sitespeedio/throttle - still very early release, test at your own risk :)

## version 1.8.2 2017-09-17

### Fixed

* Always (yes always) use no-sandbox for Chrome when running in Docker.

## version 1.8.1 2017-09-16

### Fixed

* Even bigger bottom margin (20px) for videos to make emulated mobile lastVisualChange correct.

## version 1.8.0 2017-09-13

### Added

* Easy to run Firefox Nightly, just pass --firefox.nightly (and -b firefox)
* Support for running Firefox and Chrome in headless mode --headless. You need Firefox Nightly or Chrome stable [#361](https://github.com/sitespeedio/browsertime/pull/361)
* Upgraded to Chrome 61 in the Dockerfile
* You can now change the framerate of the video with --videoParams.framerate
* You can also change the constant rate factor of the video --videoParams.crf see https://trac.ffmpeg.org/wiki/Encode/H.264#crf
* Added visualComplete95 and visualComplete99 metrics.

### Changed

* Old parameter videoRaw is renamed to --videoParams.addTimer to toogle timer/text in the video (old videoRaw is deprecated but still works).

### Fixed

* Changed Docker workdir so it is possible to use pre/post script in Docker. This means you need to map your volume as "$(pwd)":/browsertime [#363](https://github.com/sitespeedio/browsertime/pull/363)

* Changed the bottom margin for videos (made it a little larger) to fix lastVisualChange when emulating mobile [sitespeed.io #1690](https://github.com/sitespeedio/sitespeed.io/issues/1690)

## version 1.7.0 2017-08-29

### Added

* More metrics in the HAR: We now add Visual metrics, connectivity and domContentLoadedTime/domInteractiveTime. They are then picked up by PerfCascade. This was earlier done in sitespeed.io.

## version 1.6.1 2017-08-18

### Fixed

* Correct naming in the CLI help when emulating an iPhone ('iPhone 6'). It was changed in Chromedriver 2.31.0 (or was it 2.30.0?).
* Added missing browser name in the HAR when you run as Chrome as emulated.
* New go at VisualMetrics to try to avoid those partly orange screens for Chrome.

## version 1.6.0 2017-07-27

### Fixed

* Upgrade to Chrome 60 stable from 60 beta in the Docker container
* Upgrading to Chromedriver 2.31.0
* Upgrading to Selenium 3.5

### Added

* We now support adding request headers, blocking domains and using basic auth in Firefox since latest Selenium and @tobli:s [PR](https://github.com/SeleniumHQ/selenium/pull/3846) for supporting Web Extensions in Firefox!

## version 1.5.4 2017-07-19

### Fixed

* Latest NodeJS 6.11.1 in the Docker container.
* Upgrade to Geckodriver 0.18.0 for Firefox.
* Fine tuning choosing orange frames see [#1673 sitespeed.io](https://github.com/sitespeedio/sitespeed.io/issues/1673)

## version 1.5.3 2017-06-30

### Fixed

* Upgraded chrome-har to fix https://github.com/sitespeedio/sitespeed.io/issues/1654
* Upgraded Docker to use latest Chrome beta and include fonts for Hindi, Thai, Japanese, Chinese and Korean.

## version 1.5.2 2017-06-23

### Fixed

* Upgraded (again) from Chromedriver 2.28 to 2.30 with a very special hack [#347](https://github.com/sitespeedio/browsertime/pull/347).

## version 1.5.1 2017-06-22

### Fixed

* Downgraded (again) from Chromedriver 2.30 to 2.28 to get --chrome.collectTracingEvents to work again.

## version 1.5.0 2017-06-22

### Added

* Upgraded to Chromedriver 2.30.0 fixes [#337](https://github.com/sitespeedio/browsertime/issues/337).
* Upgraded to Geckodriver 0.17.0 seems to fix [#321](https://github.com/sitespeedio/browsertime/issues/321)
* Pickup metrics from the Paint Timing API [#344](https://github.com/sitespeedio/browsertime/pull/344), will work in Chrome 60.
* Updated the Docker container to Firefox 54 and Chrome 60 (beta) to fix the background color problem. [Chrome bug 727046](https://bugs.chromium.org/p/chromium/issues/detail?id=727046)

## version 1.4.0 2017-06-03

### Fixed

* Updated to latest NodeJS and FFMPeg in the Docker container.

### Added

* Set Selenium capabilities (hidden pro feature for now).

## version 1.3.0 2017-06-01

### Added

* Added --preURLDelay (in ms) so you can choose how long time you want to wait until you hit the main URL after the pre URL.

### Fixed

* Fixed setting proxy using --proxy.http and --proxy.https [#338](https://github.com/sitespeedio/browsertime/issues/338)
* Updated to chrome-har 0.2.1 that: add "serverIPAddress" field to entries, set bodySize for requests correctly, set bodySize and compression for responses correctly, and add \_transferSize field for responses, just like Chrome does.

## version 1.2.7 2017-05-26

### Fixed

* Downgraded to Chromedriver 2.29 to 2.28 to get --chrome.collectTracingEvents to work again (hope for a fix in 2.30).

## version 1.2.6 2017-05-21

### Fixed

* Setting Firefox preferences with values true/false didn't work as expected. [#336](https://github.com/sitespeedio/browsertime/issues/336)

## version 1.2.5 2017-05-14

### Fixed

* Reverted changes in 1.2.4 since it caused firstVisualChange to fire to early on desktop. [#335](https://github.com/sitespeedio/browsertime/issues/335)

## version 1.2.4 2017-05-13

### Fixed

* Internal: New version of VisualMetrics that catches frames that is partly in one (gray/orange) color.

## version 1.2.3 2017-05-12

### Fixed

* URLs with a comma-sign (",") broke Browsertime if you also collected VisualMetrics [#333](https://github.com/sitespeedio/browsertime/issues/333).

* New version of VisaulMetrics (thanks Pat) that makes possible to remove those grey background that started to appear in Chrome 58 if you run it in emulated mode. The original bug created to early first visual render in emulated mode [#323](https://github.com/sitespeedio/browsertime/issues/323).

## version 1.2.2 2017-05-11

### Fixed

* The video for Firefox now works with different view ports [#329](https://github.com/sitespeedio/browsertime/issues/329).
* More safe way to find the first white frame when cutting an creating the video [#331](https://github.com/sitespeedio/browsertime/pull/331)]
* Get Chrome NetLog (--chrome.collectNetLog) now also works on Android [#306](https://github.com/sitespeedio/browsertime/issues/306)

## version 1.2.1 2017-05-09

### Fixed

* Remove a couple of more black pixels in the video from Firefox

## version 1.2.0 2017-05-09

### Fixed

* Removed the black borders in the video from Firefox [#285](https://github.com/sitespeedio/browsertime/issues/285).

### Added

* Support for Basic Auth in Chrome (Firefox will have it in 54 as long as https://github.com/SeleniumHQ/selenium/pull/3846 gets released). Use --basicAuth username@password [#328](https://github.com/sitespeedio/browsertime/pull/328).

## version 1.1.2 2017-05-02

### Fixed

* You can now run Android devices in your Docker container on Ubuntu. Check the [README](https://github.com/sitespeedio/browsertime#test-on-your-mobile-device) for more info. Inspired by [https://github.com/sorccu/docker-adb](https://github.com/sorccu/docker-adb).

## version 1.1.1 2017-04-23

### Fixed

* New version of the browsertime extension to turn off save password bubble for Chrome.

## version 1.1.0 2017-04-23

### Changed

* Block requests by domain (--block) and add request headers (-r name:value). Only works in Chrome for now, it will get fixed for Firefox when https://github.com/SeleniumHQ/selenium/pull/3846 is released in Selenium.
* Upgrade to Selenium 3.4.0 and Geckodriver 0.15.0 to get Firefox 53.0 working.
* Docker container now uses Chrome 58 and Firefox 53.

## version 1.0.0 2017-04-07

### Changed

* Same code as beta 34, but a different feeling. =)

---

## version 1.0.0-beta.34 2017-04-06

### Added

* Support for video and SpeedIndex on Android. This is still experimental and we need help to test it on different devices!

## version 1.0.0-beta.33 2017-04-04

### Fixed
* Support legacy option for experimental.dumpChromePerflog and chrome.dumpTraceCategoriesLog from the CLI.
* Catch all type of errors if the browsers fail to start and do a retry.

### Added

* Show backendtime in the summary output in the CLI.

## version 1.0.0-beta.32 2017-03-28

### Added

* Collect and save Chrome's netlog with --chrome.collectNetLog - thank you https://github.com/worenga
* Option to maximize browser window [#275](https://github.com/sitespeedio/browsertime/pull/275) thanks again @worenga
* Add --chrome.chromedriverPath option, for using a custom chromedriver binary.
* Show VisualComplete 85% in the video and in the CLI summary.
* Include _timestamps_ entry in result json, with timestamps for when each iteration starts.

### Changed

* Renamed experimental.dumpChromePerflog to chrome.collectPerfLog. The previous name is deprecated, but will still
  work for now.
* Renamed chrome.dumpTraceCategoriesLog to chrome.collectTracingEvents. The previous name is deprecated, but will still
  work for now.

### Fixed

* Ensure output directory is created before starting a run (and before storageManager is passed to preScripts).

## version 1.0.0-beta.31 2017-03-13

### Added

* Use Chromedriver 2.28

## version 1.0.0-beta.30 2017-03-08

### Added

* Extracted (and improved) Chrome perflog->HAR parsing to separate npm module.

## version 1.0.0-beta.29 2017-03-02

### Added

* New metric when you collect video/SpeedIndex: VisualComplete85% as suggested by @jeroenvdb

### Fixed

* Increased max time to parse the performance log 60s -> 90s

## version 1.0.0-beta.28 2017-02-27

### Fixed

* Smarter way to parse (or rather cleanup) the Chrome trace logs, following the code in Lighthouse: https://github.com/GoogleChrome/lighthouse/pull/538. Mad props for cleaning up the log :) Fixes [#281](https://github.com/sitespeedio/browsertime/issues/281)

## version 1.0.0-beta.27 2017-02-26

### Added

* You can dump the Chrome trace categories to disk by using --chrome.dumpTraceCategoriesLog and load the file in Chrome timeline.
  You can also choose which trace categories you wanna use with --chrome.traceCategories. [#270](https://github.com/sitespeedio/browsertime/issues/270)

## version 1.0.0-beta.26 2017-02-22

### Added

* Improved detection of http2 pushed assets for Chrome. [#261](https://github.com/sitespeedio/browsertime/issues/261)
* Added connectivity.engine external to use when you set the connectivity outside of Browsertime [#277](https://github.com/sitespeedio/browsertime/pull/277)

## version 1.0.0-beta.25 2017-02-15

### Added

* Make it possible to include response bodies in the HAR from Firefox using --firefox.includeResponseBodies [#264](https://github.com/sitespeedio/browsertime/pull/264/)
* Set Firefox preferences through the CLI [#268](https://github.com/sitespeedio/browsertime/issues/268)

### Fixed

* Add check if entry is not undefined and request exists when creating the Chrome HAR fixes[#272](https://github.com/sitespeedio/browsertime/issues/272)

## version 1.0.0-beta.24 2017-02-10

### Added

* New option `--userTimingWhitelist` to pass a whitelist regex for filtering userTimings from results

### Fixed

* Updated example of login via pre-script to properly wait for login form to be submitted before continuing.
* Simpliefied check in Chrome if a response is pushed (only use pushStart)
* Renamed \_was_push to \_was_pushed as following same name standard as WPT if an entry is HTTP/2 pushed
* Aligned priority information in HAR with WebPageTest.
* Upgraded to Geckodriver 0.14.0

## version 1.0.0-beta.23 2017-01-10

### Fixed

* The combination of not cropping out the center of the screen and changin back to default values for Firefox deciding when the screen is orange,
  made all metrics happen to early for FF.

## version 1.0.0-beta.22 2017-01-10

### Fixed

* Different values for Chrome/Firefox to define when the screen is still orange, to make sure VisualMetrics doesn't pick up the
  orange screen.

## version 1.0.0-beta.21 2017-01-09

### Added

* Upgraded to Geckodriver 0.13.0
* Upgraded to Chromedriver 2.27.0
* Eliminate the risk to get a too early first visual change that happens sometimes in Chrome by changing VisualMetrics (see #247 and #255):
  * We removed the center cropping of images when visual metrics checks if an image is orange/white. The cropping made us miss the small orange lines that sometimes appear only in Chrome.
  * We also fine tuned (and made configurable) the number when the diff of two images (orange and white) is ... orange.
  * We re-arranged how we record the screen to record as little extra video as possible.

## version 1.0.0-beta.20 2017-01-05

### Added

* Upgraded to Geckodriver 0.12.0
* Pickup changed prio when Chrome changes prio for requests
* Updated the Docker container to use ImageMagick 6.9.7-2 to fix https://github.com/sitespeedio/browsertime/issues/247
* Added 3g connectivity profile 3gem for Emerging markets to keep in sync with WebPageTest.
* Removed crf settings when recording a video to fix https://github.com/sitespeedio/browsertime/issues/247

## version 1.0.0-beta.19 2016-12-22

### Fixed

* Use VisualMetrics with viewport config to best case find better start values
* Ignore 5% of the height/width when calculate firstVisualChange fixed #244

## version 1.0-beta.18 2016-12-14

### Added

* Upgraded to Chromedriver 2.26

### Fixed

* Changed to use straight walltime when generating HAR for HTTP/2 in Chrome (fixes problems when assets was in wrong order)
* Log request missing matching request id on debug level instead of warning

## version 1.0-beta.17 2016-12-13

### Fixed

* Setting 'network.dns.disableIPv6': true for Firefox makes Firefox in Docker 5s faster :/

* Added trap in Docker image to be able to break your runs.

## version 1.0-beta.16 2016-12-12

### Fixed

* Increased time to wait for browser to start before starting video (now 1.5 s)

## version 1.0-beta.15 2016-12-10

### Added

* Log last visual change in the info logs after a run.
* Added \_was_pushed using same standard as WebPageTest.

### Fixed

* Skip checking the first 5 frames when looking for when the video start (that makes the firstVisualRender more stable).
* Getting right URL for initiator in Chrome.

## version 1.0-beta.14 2016-12-06

### Added

* Display lastVisualChange in the video (and 2px smaller texts for metrics)

### Fixed

* Fine tune the values on when to catch the first frame #236 to make firstVisualRender more accurate when using preURL

## version 1.0-beta.13 2016-11-30

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

## version 1.0-beta.12 2016-11-20

### Added

* Add a alias/custom name to your connectivity profile. Thank you @jpvincent for the idea! https://github.com/sitespeedio/sitespeed.io/issues/1329
* Cli option to remove the created video (record the video to get SpeedIndex and then remove the video).
* Video is now mp4.

### Fixed

* Better exit handling when killing FFMpeg , overall code cleanup for ffmpeg/video
* Introduced small wait time before record video that makes the connection problem for 3g using tc go away (hopefully).

### Changed

* Videos are now named after the run.

## version 1.0-beta.11 2016-11-13

### Fixed

* Disabled infobars in Chrome (they messed up start render and SpeedIndex).

## version 1.0-beta.10 2016-11-11

### Added

* Added initiator of each request entry to chrome HAR
* Output SpeedIndex & firstVisualChange in the logs if you use VisualMetrics

### Fixed

* Generating HAR files from Chrome caused a crash in some cases. (#209)
* Entry timings in HAR files from Chrome were strings instead of numbers.
* One extra fix for outputing timing metrics in the console: If timing metrics is < 1000 ms don't convert to seconds and let always have fixed\
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

## version 1.0-beta.9 2016-10-16

### Fixed

* Set default device to eth0 when running tc (without using the CLI).

## version 1.0-beta.8 2016-10-16

### Fixed

* Also count the main request in number of requests when printing to the log.
* And output the total transfer size of the tested page.
* New version of TSProxy hopefully fixing the connect problems for some
  sites (wikipedia) see https://github.com/WPO-Foundation/tsproxy/issues/9

### Changed

* Removed option to not get statistics for the runs.
* Rollbacked SLTC so we only use tc, to make it work out of the box on Ubuntu.

## version 1.0-beta.7 2016-10-17

### Changed

* Moved the summary line to the logs and inside the engine so users of the API will get
  the same treatment.

## version 1.0-beta.6 2016-09-29

### Added

* Add chrome-esque summary line to stdout #189 thank you @moos for the PR!

### Changed

* Removed JSON input for setting connectivity custom profile, use cli params instead.

## version 1.0-beta.5 2016-09-22

### Changed

* Updated to Selenium v3.0.0-beta-3
* Updated to HAR export trigger beta 10 to make FF 49 functional

## version 1.0-beta.4 2016-09-19

### Changed

* Updated to chromedriver 2.24.

## version 1.0-beta.3 2016-09-02

### Fixed

* Query parameters in HAR files from Chrome are now correct

### Added

* HAR files from Chrome now include cookies and POST data (with some limitations)

## version 1.0-beta.2

* Log excplicit when the HAR export trigger fails, so it is easy to report the problem.
* Increased the default script timeout from 40 s to 80 s.
* Log script name if a script fails to make it easier to find failing scripts.
* Renamed the browserscripts/timings/timings.js → browserscripts/timings/pageTimings.js

## version 1.0-beta.1

* This is the first beta of 1.0. 1.0 is a TOTAL rewrite from 0.12.3. We don't use BrowserMobProxy anymore (so you don't need Java). To get the HAR from Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and Chrome we parse the timeline log and generates the HAR file.

* The beta-1 has no way of blocking requests, if you need that functionality you should wait with upgrading.

## version 0.12.3

* Upgraded Selenium to work with Firefox 47.0.1

## version 0.12.2

* Add ability to block urls (e.g. return 404) based on regex.

## version 0.12.1

* Fix parsing of --headers and --connectionRaw options. Note that JSON strings needs to be properly quoted when
  passed on the command line, e.g. --headers '{"name":"value"}'

## version 0.12.0

* Upgrade selenium-webdriver to 2.47. This means dropping node 0.10 support, but allowing installation on node 4.x.

## version 0.11.0

* Don't log 'Storing ...har' when har generation is turned off.
* Handle cases where HAR file from MobProxy is lacking log.browser without crashing.
* Set correct Browsertime version in HAR file (previously was always 1.0)
* Remove --useProxy option and replace with a --noProxy flag. Please update your scripts if you use this

## version 0.10.2

* Bug fix: Running multiple tests, included same requests many many times in one HAR #91

## version 0.10.1

* Bug fix: Show correct browser and version in the HAR file #90

## version 0.10.0

* Remove level prefix (e.g. info: ) from console log lines. Log files aren't affected.
* Normalized Navigation Timing Data: All navigation timing metrics are now relative from Navigation start instead of using timestamps #88
* Navigation Timings are now included in the statistics so you can get median times for all Navigation Timing metrics.

## version 0.9.8

* Upgrading Selenium version to 2.46.1 that makes it work on Windows (again).

## version 0.9.7

* Upgrading selenium version to 2.46.0 that will make Firefox (38) useable again.

## version 0.9.6

* Increased timeouts to be 2 minutes instead of 1 minute. Running using mobile2g times out a lot.

## version 0.9.5

* Added more default connection types: mobile2g and mobile3gslow
* Ability to avoid sandbox mode when runnig Chrome (use with care)

## version 0.9.4

* Possible to configure a selenium server (hopefully make IE run smoother on Windows and
  Chrome on Linux).

## version 0.9.3

* User timing marks was missing from statistics since 0.9. This puts then back!
* Timeout a run if it takes too long. On Linux Chrome/Chromedriver can hang, making Browsertime hang. This fix kill the chromedriver and signal an error if it happens.

## version 0.9.2

* Fixed installation issue on npm v0.12.0, Windows 7 (thanks Patrick Wieczorek)
* Hello HTTPS! We now proxy HTTPS traffic making HAR Files containing HTTPS requests.
* Internet Explorer: Clean session between runs, ignore zoom settings and set proxy per process
* Internal: Killing Chromedriver on Linux if it is up and running after a finished round. Need to be run after each URL when we have a working timeout for Chrome.

## version 0.9.1

* Fixed incorrect HAR files generated by version 0.9.0 (page title was missing).
* Renaming resourceTiming to resourceTimings to follow our pattern.

## version 0.9.0

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

## version 0.8.26

## Changed

* Update to Selenium 2.45.1 to get latest bug fixes.
* Avoid hangs when fetching urls by explicitly set timeout values in Selenium drivers.

## version 0.8.25

* New Selenium version (2.45) to support Firefox 36

## version 0.8.24

* Fix that kills the BMP on Windows (using taskkill)

## version 0.8.23

* Log to standard log when uncaught exception happens, so that it will be propagated to sitespeed.io
* So we have a real proble with processes that just hangs, it happens on when we get an uncaught exception,
  one of the problems is Selenium/Chromedriver, we will try to fix the main issue but for now we will exit
  the process #74

## version 0.8.22

* You can now choose to supply a Javascript that will decide when a run is finished. The default
  script is 'return window.performance.timing.loadEventEnd>0'. Use the parameter --waitScript

* The browsermob prixy will now test a port and use it if it's free. Before the port was hardcoded.

## version 0.8.21

* Upgraded to the new BrowserMobProxy 2.0.0

## version 0.8

* Ooops, what happend? the new version is written in NodeJS, instead of Java.
* Check out the README or --help to see new input format.
* You can now run your own javascript in the browser and get the data back in the JSON.
* Support for getting timings using PhantomJS 2.
* Limit the connection speed.

## version 0.7

* Add support for sending BASIC AUTH credentials, by specifying the --basic-auth option.
* Add support for generating har files, by specifying the --har-file option.
* Add support for sending request headers by specifying the --headers option.
* Bugfix: Set right values for serverResponseTime
* Upgrade Selenium to version 2.41.

## version 0.6 (2014-02-05)

* Fix crash while trying to run resource timing measurements in Firefox.
* Provide better error messages if chromedriver, IEDriverServer or Firefox is missing.
* Upgraded to latest version of Selenium, for (hopefully) increased stability in the interaction with browsers.
* Suppress chromedriver diagnostics output (Starting ChromeDriver...) when running Chrome
* Add --verbose and --debug option for getting additional information printed as Browsertime runs.

## version 0.5 (2014-01-09)

* Windows support - Browsertime now ships with a bat file, and Internet Explorer has been confirmed to work.
* Collect resource timing metrics (http://www.w3.org/TR/resource-timing/), included when outputting all metrics using
  the --raw option.
* Add support for specifying http proxy, using a new --proxyHost option.
* Updated maven groupId and Java package name to use net.browsertime instead of com.soulgalore. This does not affect
  users of the command line tool, only programmers embedding the browsertime jar in other tools.
* Added ignore zoom settings for Internet Explorer and type for msFirstPaint
* Include browserTimeVersion entry in static page data.

## version 0.4 (2013-11-15)

* User Timing marks and measures should now be compatible with Firefox 25. Custom user marks are also converted to
  "synthetic" measures, with duration as time from the navigationStart event. This way user marks are also
  included in statistics.

## version 0.3 (2013-11-09)

* Added frontEndTime (responseEnd & loadEventStart) & backEndTime (navigationStart, responseStart) measurements to make it cleaner when comparing.
* Collect page data (browser version etc.) on first timing run. This reduces the number of times the browser is
  launched, making Browsertime run faster.
* Added -t option to set timeout value when loading urls (default remains 60 seconds).
* Created packages as zip and tar.gz that includes a shell script to run Browsertime, all jars, README, and CHANGELOG.

## version 0.2 (2013-11-05)

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

## version 0.1 (2013-10-07)

* First release
