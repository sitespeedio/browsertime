# Browsertime changelog (we do [semantic versioning](https://semver.org))

## 24.1.0 - UNRELEASED

### Added
* Include Chrome/Firefox configuration in the browser section of the result JSON [#2259](https://github.com/sitespeedio/browsertime/pull/2259)

### Fixed
* Upgraded to use Webdriver 4.28.1 [#2258](https://github.com/sitespeedio/browsertime/pull/2258).

## 24.0.1 - 2025-01-21
### Fixed
*  If Jimp is missing when storing an image, log and write the file as PNG [#2257](https://github.com/sitespeedio/browsertime/pull/2257).

## 24.0.0 - 2025-01-20

The 24.0.0 release remove a lot of dependencies. Since we implemented Browsertime the first time, there are many things that are easy to do in modern NodeJS. Those things have now been implemented in Browsertime.

This release would work exactly as before, the only thing that changed is that usb-power-profiling is a optional dependency. That means that if you install using `--omit=optional` that dependency is not installed.

### Changed
* Moved usb-power-profiling to be an optional package [#2249](https://github.com/sitespeedio/browsertime/pull/2249).

### Added
* Edgedriver 132 [#2236](https://github.com/sitespeedio/browsertime/pull/2254).
* Chromedriver 132 [#2236](https://github.com/sitespeedio/browsertime/pull/2253).
* Chrome and Edge 132, Firefox 134 in the Docker container + NodeJS 22 [#2255](https://github.com/sitespeedio/browsertime/pull/2255).

### Fixed
* Replace dependencies with local implementation:
  * Replace btoa [#2233](https://github.com/sitespeedio/browsertime/pull/2233).
  * Replace hasbin [#2234](https://github.com/sitespeedio/browsertime/pull/2234).
  * Replace DayJS [#2235](https://github.com/sitespeedio/browsertime/pull/2235).
  * Replace lodash.pick [#2237](https://github.com/sitespeedio/browsertime/pull/2237).
  * Replace lodash.groupBy [#2238](https://github.com/sitespeedio/browsertime/pull/2238).
  * Replace find-up [#2240](https://github.com/sitespeedio/browsertime/pull/2240).
  * Replace lodash.isEmpty [#2241](https://github.com/sitespeedio/browsertime/pull/2241).
  * Replace get-port [#2242](https://github.com/sitespeedio/browsertime/pull/2242).
  * Replace jimp with jimp custom [#2243](https://github.com/sitespeedio/browsertime/pull/2243).
  * Replace @cypress/xvfb [#2245](https://github.com/sitespeedio/browsertime/pull/2245).
  * Replace intel (log) with sitespeed.io/log [#2246](https://github.com/sitespeedio/browsertime/pull/2246).
  * Replace lodash.set [#2250](https://github.com/sitespeedio/browsertime/pull/2250).
  * Replace lodash.get [#2251](https://github.com/sitespeedio/browsertime/pull/2251).
* Fix Docker file ENV to follow the new standard [#2239](https://github.com/sitespeedio/browsertime/pull/2239).


## 23.5.0 -  2024-12-23
### Added
* Added `--userTimingBlockList` [#2227](https://github.com/sitespeedio/browsertime/pull/2227).

### Fixed
* Updated to webdriver 4.28 [#2226](https://github.com/sitespeedio/browsertime/pull/2226).
* Updated dev dependencies [#2228](https://github.com/sitespeedio/browsertime/pull/2228).
* Fix so the check for gnirehtet always use --android.gnirehtet to fix problems setting it in sitespeed.io [#2229](https://github.com/sitespeedio/browsertime/pull/2229).
* Update to execa 9.5.2 [#2231](https://github.com/sitespeedio/browsertime/pull/2231).
* Update to adbkit 3.3.8 [#2232](https://github.com/sitespeedio/browsertime/pull/2232).
* Fix so you cannot use gnirehtet with webpagereplay [#2230](https://github.com/sitespeedio/browsertime/pull/2230).


## 23.4.5 -  2024-12-20
### Fixed
* Change bottom margin from 10 to 14 pixel when recording a video on mobile, se bug [#2224](https://github.com/sitespeedio/browsertime/issues/2224) and PR [#2225](https://github.com/sitespeedio/browsertime/pull/2225).

## 23.4.4 -  2024-12-18
### Fixed
* A more robust gnirehtet check when you run your Android test [#2223](https://github.com/sitespeedio/browsertime/pull/2223).

## 23.4.3 -  2024-12-11
### Fixed
* Update to USB power profiling 1.5.0 [#2221](https://github.com/sitespeedio/browsertime/pull/2221).

## 23.4.2 -  2024-12-10
### Fixed
* Improve how we compute the power consumption numbers from the Firefox Profiler output PR by [Nazım Can Altınova](https://github.com/canova) [#2220](https://github.com/sitespeedio/browsertime/pull/2220)

## 23.4.1 -  2024-11-23
### Fixed
* Cleanup of the extra timings that is added to the timeline for Chrome [#2218](https://github.com/sitespeedio/browsertime/pull/2218)

## 23.4.0 -  2024-11-22

### Added
* Collect more information about the largest contentful paint [#2206](https://github.com/sitespeedio/browsertime/pull/2206)
* Add extra timings and new custom timeline to the Chrome timeline [#2217](https://github.com/sitespeedio/browsertime/pull/2217). Inspired by [
Andy Davies](https://github.com/andydavies) cool [https://github.com/andydavies/perf-timeline-to-devtools-profile](https://github.com/andydavies/perf-timeline-to-devtools-profile).

### Fixed
* More configuration tuning for Firefox [#2216](https://github.com/sitespeedio/browsertime/pull/2216).


## 23.3.3 - 2024-11-22
### Fixed
* Disable search suggestion requests for Firefox [#2215](https://github.com/sitespeedio/browsertime/pull/2215)
* Fix for including HTTP requests in the Firefox profile [#2214](https://github.com/sitespeedio/browsertime/pull/2214).
* Fix when running --enableProfileRun and get visual metrics. It used to generate an error log, this fixes that [#2213](https://github.com/sitespeedio/browsertime/pull/2213).

## 23.3.2 - 2024-11-21
### Fixed
* Disable some calls back to home from Firefox [#2212](https://github.com/sitespeedio/browsertime/pull/2212).

## 23.3.1 - 2024-11-13
### Fixed
* Disable security warning in Firefox 132 [#2208](https://github.com/sitespeedio/browsertime/pull/2208) that fixes [#2207](https://github.com/sitespeedio/browsertime/issues/2207).

## 23.3.0 - 2024-11-12
### Added
* Updated to Chrome and Chromedriver 131 [#2209](https://github.com/sitespeedio/browsertime/pull/2203)
### Fixed
* Updated to ff-test-bidi-har-export to 0.0.17 [#2204](https://github.com/sitespeedio/browsertime/pull/2204)

## 23.2.0 - 2024-10-20
### Added
* Updated to Chrome and Chromedriver 130 [#2192](https://github.com/sitespeedio/browsertime/pull/2192)
* The Chrome in the ARM container is bumped from 107 to 130 [#2194](https://github.com/sitespeedio/browsertime/pull/2194).
 
### Fixed
* New Geckodriver install that fixes running on ARM in the Docker container [#2193](https://github.com/sitespeedio/browsertime/pull/2193).


## 23.1.2 - 2024-10-11
### Fixed
* Updated Chrome HAR to 1.0.1 [#2191](https://github.com/sitespeedio/browsertime/pull/2191).

## 23.1.1 - 2024-10-08
### Fixed
* Updated to har export 0.0.16 for Firefox that fixes the HAR timing problem in [#2189](https://github.com/sitespeedio/browsertime/issues/2189) [#2190](https://github.com/sitespeedio/browsertime/pull/2190).

## 23.1.0 - 2024-10-08
### Added
* Log if you use a profile template for Firefox [#2186](https://github.com/sitespeedio/browsertime/pull/2186).
* Update to Firefox 131 and Edge 129 in the Docker container [#2188](https://github.com/sitespeedio/browsertime/pull/2188).

### Fixed
* Updated to Chrome-HAR [#2187](https://github.com/sitespeedio/browsertime/pull/2187).

## 23.0.0 - 2024-09-23

### Breaking
* Disable camel case configuration that comes automatically with yargs [#2182](https://github.com/sitespeedio/browsertime/pull/2182). This is a breaking change ONLY if you didn't follow our doecumentation/help and used internal YARGS configuration names for our CLI configuration.

### Added
* Updated Docker container with Chrome 129, Firefox 130. New Chromedriver [#2181](https://github.com/sitespeedio/browsertime/pull/2181).

### Fixed
* Updated to Selenium 4.25.0 [#2185](https://github.com/sitespeedio/browsertime/pull/2185).
* Use HAR export 0.0.15 for upcoming changes in Firefox [#2184](https://github.com/sitespeedio/browsertime/pull/2184).
* Fixes the internal configuration object for android. The old solution created an array with objects instead of just keys on the object.[#2183](https://github.com/sitespeedio/browsertime/pull/2183).

## 22.10.2 - 2024-09-13
### Fixed
* Fix for wait.byIdAndVisible command [#2179](https://github.com/sitespeedio/browsertime/pull/2179).

## 22.10.1 - 2024-09-04
### Fixed
* Upgraded Bidi HAR to 0.0.14 that filters out data:text URLs thar is picked up in Firefox 130 [#2177](https://github.com/sitespeedio/browsertime/pull/2177).
* Call stopSampling on browser stop during android power testing [#2176](https://github.com/sitespeedio/browsertime/pull/2176).

## 22.10.0 - 2024-09-03
### Added
* Chromedriver 128 [#2175](https://github.com/sitespeedio/browsertime/pull/2175)
* Chrome 128, Firefox 129, Edge 127 [#2173](https://github.com/sitespeedio/browsertime/pull/2173)
### Fixed
* Updated dependencies: usb-profiling, fast-stats, webdriver, execa, dayjs [#2174](https://github.com/sitespeedio/browsertime/pull/2174).

## 22.9.0 - 2024-08-26
### Added
* Geckodriver 0.35.0 [#2170](https://github.com/sitespeedio/browsertime/pull/2170)
### Fixed
* Stopping gnirehtet throwed errors [#2172](https://github.com/sitespeedio/browsertime/pull/2171).
* Updated to Throttle 5.0.1 that have nicer ifb0 handling [#2172](https://github.com/sitespeedio/browsertime/pull/2172)

## 22.8.0 - 2024-07-30
### Added
* Edgedriver 126 [#2166](https://github.com/sitespeedio/browsertime/pull/2166)

### Fixed
* Disable search engine choice screen on startup for Chrome 127+ [#2168](https://github.com/sitespeedio/browsertime/pull/2168)
* Update dev dependencies [#2167](https://github.com/sitespeedio/browsertime/pull/2167)

## 22.7.0 - 2024-07-25
### Added
* Updated to Chrome and Chromedriover 127 [#2164](https://github.com/sitespeedio/browsertime/pull/2164).

### Fixed
* Updated to Selenium 4.23.0 [#2161](https://github.com/sitespeedio/browsertime/pull/2161).
* Add extra check if the HAR file page misses an URL [#2160](https://github.com/sitespeedio/browsertime/pull/2160).

## 22.6.0 - 2024-07-15
### Added
* Updated to Firefox 128 and Edge 126 in the Docker container [#2158](https://github.com/sitespeedio/browsertime/pull/2158).
* Add request header using Bidi for Firefox (needs Firefox 128 or later) [#2108](https://github.com/sitespeedio/browsertime/pull/2108).

### Fixed
* Updated to Chrome HAR 0.13.5 [#2157](https://github.com/sitespeedio/browsertime/pull/2157)

## 22.5.5 - 2024-07-07
### Fixed
* Fix stopping --tcpdump [#2155](https://github.com/sitespeedio/browsertime/pull/2155).

## 22.5.4 - 2024-07-06
### Fixed
* Update to Chrome-HAR 0.13.3 [#2148](https://github.com/sitespeedio/browsertime/pull/2148).
* Update Chrome remore interface [#2149](https://github.com/sitespeedio/browsertime/pull/2149).
* Update execa, dayjs and get-port [#2153](https://github.com/sitespeedio/browsertime/pull/2153).
* Update developer dependencies [#2154](https://github.com/sitespeedio/browsertime/pull/2154), [#2152](https://github.com/sitespeedio/browsertime/pull/2152), [#2151](https://github.com/sitespeedio/browsertime/pull/2151) and [#2150](https://github.com/sitespeedio/browsertime/pull/2150).

## 22.5.3 - 2024-06-25
### Fixed
* Another fix to make IntelliSense/Code completion work again [#2147](https://github.com/sitespeedio/browsertime/pull/2147).

## 22.5.2 - 2024-06-24
### Fixed
* Updated Selenium dependencies [#2146](https://github.com/sitespeedio/browsertime/pull/2146).

## 22.5.1 - 2024-06-24
### Fixed
* Fixed exporting to make IntelliSense/Code completion work again [#2145](https://github.com/sitespeedio/browsertime/pull/2145).

## 22.5.0 - 2024-06-14
### Added
* Updated the Docker container to include Chrome 126 and Firefox 127. Chromedriver has been updated to 126 [#2141](https://github.com/sitespeedio/browsertime/pull/2141).

## 22.4.1 - 2024-06-07
### Fixed
* Make sure the engine is stopped before the extra video/profile run [#2140](https://github.com/sitespeedio/browsertime/pull/2140).

## 22.4.0 - 2024-06-06
### Added
* Use `--enableVideoRun` to get one extra run with a video and visual metrics [#2139](https://github.com/sitespeedio/browsertime/pull/2139)

## 22.3.0 - 2024-06-04
### Added
* Add the ability to gather power usage measurements on Android from USB power meters, thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#2134](https://github.com/sitespeedio/browsertime/pull/2134).
* Add support to visualmetrics to identify key frames matching the given colors, thank you [aosmond](https://github.com/aosmond) for PR [#2119](https://github.com/sitespeedio/browsertime/pull/2119).

### Fixed
* Removed DOMContentFlushed for Firefox thank you [florinbilt](https://github.com/florinbilt) for PR [#2138](https://github.com/sitespeedio/browsertime/pull/2138).

## 22.2.0 - 2024-05-24
### Added
* New command: Mouse single click on a element with a specific id `commands.mouse.singleClick.byId(id)` and `commands.mouse.singleClick.byIdAndWait(id)` [#2135](https://github.com/sitespeedio/browsertime/pull/2135).
* New command: `commands.wait.byIdAndVisible(id, maxTime)` - wait for an element with id to become visible [#2137](https://github.com/sitespeedio/browsertime/pull/2137).

### Fixed
* Make sure errors are correctly logged if you cannot add text to element [#2136](https://github.com/sitespeedio/browsertime/pull/2136).

## 22.1.0 - 2024-05-20
### Added
* Updated to Edge and Edgedriver 125 [#2132](https://github.com/sitespeedio/browsertime/pull/2132).

### Fixed
* Updated to Selenium Webdriver 4.21.0 [#2131](https://github.com/sitespeedio/browsertime/pull/2131).
* Trying to remove new Chrome popup [#2130](https://github.com/sitespeedio/browsertime/pull/2130).


## 22.0.0 - 2024-05-16

### Breaking

There's a breaking change for Firefox if you add your own request header or if you use scripting and want to clear the browser in your script:

* Removed the [Browsertime extension](https://github.com/sitespeedio/browsertime-extension). In the old days the extension helped Chrome and Firefox to add cookies, requestheaders, clear caches and more. However all that functionality has been implemented in CDP for Chrome and most functionality using Bidi webdriver for Firefox. At the moment we drop two things for Firefox: Add request header and clear the cache inside of scripting. We hope both soon is supported in Bidi [#2124](https://github.com/sitespeedio/browsertime/pull/2124).

* The ff-test-bidi-har-export is now the default (and only) way to get a HAR file from Firefox. It's faster than the old HAR exporter and works on both desktop and mobile. It's also is implemented using Bidi so when other browsers also support bidi they can also export a HAR [#2123](https://github.com/sitespeedio/browsertime/pull/2123).

### Added
* Updated the Docker container to use Chrome 125 and Firefox 126 and Edge 124 [#2125](https://github.com/sitespeedio/browsertime/pull/2125) and [#2128](https://github.com/sitespeedio/browsertime/pull/2128).

## 21.7.1 - 2024-04-03
### Fixed
* Bug fix: If you test a URL that failed, we got an error that didn't produce the browsertime.json [#2120](https://github.com/sitespeedio/browsertime/pull/2120).
* Updated to Selenium webdriver 4.20.0 [#2121](https://github.com/sitespeedio/browsertime/pull/2121).

## 21.7.0 - 2024-04-03
### Added
* Edge and Edgedriver 123 [#2116](https://github.com/sitespeedio/browsertime/pull/2116).

### Fixed
*  Updated to Selenium 4.19.0 [#2117](https://github.com/sitespeedio/browsertime/pull/2117).
* Block domains using Bidi instead of the extension server for Firefox [#2118](https://github.com/sitespeedio/browsertime/pull/2118).

## 21.6.1 - 2024-03-22
### Fixed
* Fix running Safari TP. Thank you [KS](https://github.com/92kns) for PR [#2115](https://github.com/sitespeedio/browsertime/pull/2115).

## 21.6.0 - 2024-03-20
### Added
* Chrome 123, Firefox 124 and Edge 122 in the Docker container [#2110](https://github.com/sitespeedio/browsertime/pull/2110).
* Chromedriver 123 and Edgedriver 122 [#2111](https://github.com/sitespeedio/browsertime/pull/2111).

### Fixed
* Fix a bug in stopAsError so that you can continue to measure other pages after the stop. Also follow the documentation and mark the run as a failure [#2107](https://github.com/sitespeedio/browsertime/pull/2107).
* Use bidi for Firefox when using `--basicAuth` [#2093](https://github.com/sitespeedio/browsertime/pull/2093) (needs Firefox 124).
* Use bidi for Firefox when using `--cookie` [#2090](https://github.com/sitespeedio/browsertime/pull/2090) (needs Firefox 124).

## 21.5.4 - 2024-03-13
### Fixed
* Fix for `--injectJs` for Firefox [#2103](https://github.com/sitespeedio/browsertime/pull/2103).

## 21.5.3 - 2024-03-12
### Fixed
* Fixed `commands.bidi.*` that stopped working [#2101](https://github.com/sitespeedio/browsertime/pull/2101).
* Fixed missing Loaf data [#2100](https://github.com/sitespeedio/browsertime/pull/2100).

## 21.5.2 - 2024-03-12
### Fixed
* Another bug fix: Getting Long Animation Frame (loaf) was broken [#2099](https://github.com/sitespeedio/browsertime/pull/2099).

## 21.5.1 - 2024-03-12
### Fixed
* There was a bug in how we collect CPU power from Firefox and add it to the statistics. Fixed in [#2098](https://github.com/sitespeedio/browsertime/pull/2098).

## 21.5.0 - 2024-03-12
### Added
* Firefox: 
  * Move injectJS functionality to Bidi [#2088](https://github.com/sitespeedio/browsertime/pull/2088). This makes it possible to inject JS in Firefox on mobile.
  * Expose Bidi in commands [#2091](https://github.com/sitespeedio/browsertime/pull/2091). You can now use webdriver bidi direct in your commands.
### Fixed
* Fixed command action.clear() that actually didn't clear the command [#2095](https://github.com/sitespeedio/browsertime/pull/2095).

## 21.4.0 - 2024-03-08
### Added
* Added the following trace categories for Chrome that now is used by default when you turn on the timeline: 'disabled-by-default-devtools.timeline.frame', 'disabled-by-default-devtools.timeline.invalidationTracking','loading', 'latencyInfo' - done in [#2086](https://github.com/sitespeedio/browsertime/pull/2086).
* Added a simple Loaf-script to get the 10 largest loaf. Lets iterate over the script and see how we can get the most useful information from it [#2087](https://github.com/sitespeedio/browsertime/pull/2087).

## 21.3.1 - 2024-02-26
### Fixed
* Updated Chromedriver install with new version that fixes the Windows install [#2084](https://github.com/sitespeedio/browsertime/pull/2084).
* Updated to Selenium 4.18.1 [#2082](https://github.com/sitespeedio/browsertime/pull/2082).

## 21.3.0 - 2024-02-21
### Added
* Edgedriver 121 [#2078](https://github.com/sitespeedio/browsertime/pull/2078).
* Chromdriver 122 [#2080](https://github.com/sitespeedio/browsertime/pull/2080).
* Chrome 122 and Firefox 123 in the Docker container [#2081](https://github.com/sitespeedio/browsertime/pull/2081).

### Fixed
* Log that Throttle is used inside Docker [#2077](https://github.com/sitespeedio/browsertime/pull/2077).

## 21.2.1 - 2024-02-11
### Fixed
* Fix correct JavaScript signature for stopAsError in types.

## 21.2.0 - 2024-02-11
### Added
* Edge 121 in the Docker container [#2071](https://github.com/sitespeedio/browsertime/pull/2071).
* You can stop a measurement as a failure and make sure no metrics is collected. This is useful if you catch an error in try/catch when trying to measure a page. `measure.stopAsError(failureMessage, optionalURL)`. Add your message and if you know the URL, add it. [2076](https://github.com/sitespeedio/browsertime/pull/2076).

### Fixed
*  Set correct viewports for the following emulated mobiles for Chrome: iPhone 14 Pro Max [#2070](https://github.com/sitespeedio/browsertime/pull/2070).
* Update adbkit to 3.2.6 [#2069](https://github.com/sitespeedio/browsertime/pull/2069).
* Selenium 4.17.0 [#2068](https://github.com/sitespeedio/browsertime/pull/2068).
* There was a missing await when getting the tcpdump [#2075](https://github.com/sitespeedio/browsertime/pull/2075) 
* Remove all trace level logs (and do debug instead) since trace added unnecessary stacktraces to the log [#2074](https://github.com/sitespeedio/browsertime/pull/2074).

## 21.1.0 - 2024-01-24
### Added
* Firefox 122, Chrome 121 and Chromedriver 121 [#2067](https://github.com/sitespeedio/browsertime/pull/2067).

### Fixed
* Set correct viewports for the following emulated mobiles for Chrome: iPad Mini iPad Air, iPhone 14 Pro, Pixel 7 and Samsung Galaxy A51/71 [#2065](https://github.com/sitespeedio/browsertime/pull/2065).

## 21.0.0 - 2024-01-07

The new version uses JSDoc to generate documentation for scripting and make it possible to use code completion/Intellisense! You can read the [new documentation here](https://www.sitespeed.io/documentation/sitespeed.io/scripting/tutorial-08-Setting-Up-IntelliSense.html).

### Added
* Upgraded to [Geckodriver 0.34.0](https://github.com/mozilla/geckodriver/releases/tag/v0.34.0) [#2049](https://github.com/sitespeedio/browsertime/pull/2049).
* Collect CPU consumption for Firefox. Turn that on with `--firefox.powerConsumption true` and including `power` as a geckoProfilerParams.features [#2046](https://github.com/sitespeedio/browsertime/pull/2046).
* Added more commands for mouse click on text [#2054](https://github.com/sitespeedio/browsertime/pull/2054).
* Updated AndroidCommand so you can run shell on your Android device as root [#2055](https://github.com/sitespeedio/browsertime/pull/2055).
* If you mark a test as failure, the exit code from Browsertime will be 1. If the exitCode is set in scripting, we use that and will not change that [#2057](https://github.com/sitespeedio/browsertime/pull/2057).
* Generate documentation for scripting using JSDoc [#2059](https://github.com/sitespeedio/browsertime/pull/2059).
* Make it easy to use Seleniums action API. Get access to the new command using commands.action.getActions() and chain the action. [#2061](https://github.com/sitespeedio/browsertime/pull/2061)


### Fixed
* Make sure the visual metrics files are inlcuded in the Docker file [#2053](https://github.com/sitespeedio/browsertime/pull/2053).
* Removing QVH from the npm package (used for iPhone video recording but not working) [#2051](https://github.com/sitespeedio/browsertime/pull/2051)
* Removing visual metrics test images from the npm package [#2050](https://github.com/sitespeedio/browsertime/pull/2050).
* Removed the Chromedriver fix that was needed when Chrome for testing broke testing on Chrome :D [#2045](https://github.com/sitespeedio/browsertime/pull/2045).
* Refactor of commands/context object to prepare for supporting JSDoc and a little TypeScript to add code completion/IntelliSense in editors [#2047](https://github.com/sitespeedio/browsertime/pull/2047).
* Updated documentation for scripting with better JSDoc [#204](https://github.com/sitespeedio/browsertime/pull/2048).
* The code for getting Interaction to next paint was broken. This PR fixes it, make the code cleaner and gives more attribution [#2060](https://github.com/sitespeedio/browsertime/pull/2060).

## 20.0.0 - 2023-12-22

### Breaking
* Changed `--userTimingWhitelist` to `--userTimingAllowList` in [#2023](https://github.com/sitespeedio/browsertime/pull/2023).
* Reading pageCompleteCheck JavaScript from file now works as intended. It should be a plain JavaScript file named .js [#2034](https://github.com/sitespeedio/browsertime/pull/2034) see [#912](https://github.com/sitespeedio/browsertime/issues/912)

### Fixed
* Group page load parameters as PageLoad to make them easier to find using `--help` [#2035](https://github.com/sitespeedio/browsertime/pull/2035).
* Fix starting Firefox 121 on Mac [#2043](https://github.com/sitespeedio/browsertime/pull/2043).

### Added
* Firefox 121 in the Docker container.g

## 19.3.1 - 2023-12-18
### Fixed 
* Ensure that visual metrics python script is included in the release.

## 19.3.0 - 2023-12-18

### Added
* Updated Chromedriver and Edgedriver to 120 [#2033](https://github.com/sitespeedio/browsertime/pull/2033).

### Tech
* Moved the visual metrics python scripts to a new home [#2032](https://github.com/sitespeedio/browsertime/pull/2032).

## 19.2.0 - 2023-12-11
### Added
* Updated to Chrome and Edge 120 in the Docker container [#2031](https://github.com/sitespeedio/browsertime/pull/2031).

### Fixed
* Updated to Selenium 4.16.0 [#2026](https://github.com/sitespeedio/browsertime/pull/2026).
* Updated dev dependencies and find-up [#2029](https://github.com/sitespeedio/browsertime/pull/2029).
* Recommend NodeJS 18 or later in the package.json [#2030](https://github.com/sitespeedio/browsertime/pull/2030). Browsertime 16.0.0 removed support for NodeJS 16.

## 19.1.0 - 2023-11-27

### Added
* Firefox 120 in the Docker container.

### Fixed
* New Geckodriver installer that on Mac ARM uses ARM version of Geckodriver.

## 19.0.0 - 2023-11-15
### Breaking
* This only affects you if you run your tests on a rooted Moto G5: With PR[#2021](https://github.com/sitespeedio/browsertime/pull/2021) we add the ability to set the CPU speed for the phone at min/middle/max (the same way as possible on Samsung A51). Before the speed always was set to max. Default now is that the CPU speed will be set to min (the same way as the A51).

### Fixed
* Largest contentful paint and First contentful paint in Firefox now also fills the "googleWebitals" fields in the results. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#2018](https://github.com/sitespeedio/browsertime/pull/2018) and my PR [#2020](https://github.com/sitespeedio/browsertime/pull/2020).
* Make sure `--android.pinCPUSpeed` works [#2019](https://github.com/sitespeedio/browsertime/pull/2019)

## 18.0.0 - 2023-11-07

### Breaking
* Dropping support for NodeJS 16.

### Fixed
* Updated all dev-dependencies to latest versions [#2013](https://github.com/sitespeedio/browsertime/pull/2013).
* Updated  GitHub Actions to use latest versions of actions and Ubuntu 22.04 [#2012](https://github.com/sitespeedio/browsertime/pull/2012), [#2014](https://github.com/sitespeedio/browsertime/pull/2014) and [#2016](https://github.com/sitespeedio/browsertime/pull/2016)
* Updated all dependencies to latest versions: ADB kit 3.2.5 [#2017](https://github.com/sitespeedio/browsertime/pull/2017), execa, dayjs, get-port and Chromedriver [#2015](https://github.com/sitespeedio/browsertime/pull/2015).

## 17.19.0 - 2023-11-03
### Added 
* Updated to Chrome, Firefox and Edge 119 in the Docker container [#2010](https://github.com/sitespeedio/browsertime/pull/2010).
* Updated to Edgedriver 119.

### Fixed
* Updated to Selenium 4.15.0 [#2011](https://github.com/sitespeedio/browsertime/pull/2011).

## 17.18.1 - 2023-10-31
### Fixed
* WebDriver 4.14.0
* Chromedriver 119.0.6045-59

## 17.18.0 - 2023-10-23
### Added
* Updated to Chromedriver 119 [#2003](https://github.com/sitespeedio/browsertime/pull/2003). 119 works with both Chrome 118 and 119 so it fixes [#1197](https://github.com/sitespeedio/browsertime/issues/1997).
* Add support for network idle method to know when to end a test that uses network logs. Uses Bidi for Firefox and CDP for Chrome to listen on network events to know when to end a test. By default 5 seconds idle network time ends a tests (you could have network responses that hasn't arrived yet) [#1960](https://github.com/sitespeedio/browsertime/pull/1960). Potentially this can help SPA users or users where the page uses iframes. You can try it out by adding `--pageCompleteCheckNetworkIdle` yo your command line. This is still some work in progress but feel free to try ut out.
* The resources script now collects number of resources served from the browser cashe for browser that supports that through the resource timing API [#1998](https://github.com/sitespeedio/browsertime/pull/1998)  

### Fixed
* Make sure timer always is cleared. There was case of where we do a rase beteween a promise and a timeout where the timeout timer wasn't cleared/removed [#2005](https://github.com/sitespeedio/browsertime/pull/2005).
* Better way to get the url when you use GeckoProfiler.stop for Firefox, thank you [Nazım Can Altınova](https://github.com/canova) for PR [#1999](https://github.com/sitespeedio/browsertime/pull/1999)

## 17.17.0 - 2023-10-11
### Added
* Firefox 118, Edge 117 and Chrome/Chromedriver 118 in the Docker container [#1996](https://github.com/sitespeedio/browsertime/pull/1996).
* Expose trace start/stop for Chrome in scripting (the same way as for Firefox). Thank you [KS](https://github.com/92kns) for [#1988](https://github.com/sitespeedio/browsertime/pull/1988). Documentation is coming when the functionality is rolled out in sitespeed.io.

### Updated
* Updated to Selenium 4.12

## 17.16.0 - 2023-09-04
### Added
* Firefox 117 and Edge 116 in the Docker container.

### Fixed 
* Updated the BiDi HAR exporter for Firefox to version 0.0.12. This version will not work with Firefox 116 so if you use the BiDi HAR exporter you need to upgrade to Firefox 117.

## 17.15.0 - 2023-08-16
### Added
* Updated Chrome and Chromedriver to 116.

## 17.14.3 - 2023-08-16

### Fixed
* Updated to Selenium 4.11.1 [#1978](https://github.com/sitespeedio/browsertime/pull/1978).
* Updated Chrome and Chromedriver to minor versions.

## 17.14.2 - 2023-07-31
### Fixed
* The auto build of release Docker container was broken so no tagged containers was pushed.

## 17.14.1 - 2023-07-31

### Fixed
* Default jimp resize didn't handle large values (2000) when running in Docker AMD on a ARM machine so changing to another algorithm (HERMITE) [#1977](https://github.com/sitespeedio/browsertime/pull/1977).

* Update: chrome-har, dayjs, execa, chrome-remote-interface and jimp [#1976](https://github.com/sitespeedio/browsertime/pull/1976).

## 17.14.0 - 2023-07-24

### Added
* Edge and Edgedriver 115 [#1973](https://github.com/sitespeedio/browsertime/pull/1973).

## 17.13.1 - 2023-07-22

### Tech
* Internal fix how the render blocking result is added [#1972](https://github.com/sitespeedio/browsertime/pull/1972).


## 17.13.0 - 2023-07-21
### Fixed
* Fix for Chromedriver 115 so that it works on Mac again [#1971](https://github.com/sitespeedio/browsertime/pull/1971).

### Added
* Edgedriver 114 [#1969](https://github.com/sitespeedio/browsertime/pull/1969)

### Tech
* Run tests on Chrome/Firefox/Edge on Mac OS on our GitHub Actions to catch the next time Chromedriver is broken on Mac [#1970](https://github.com/sitespeedio/browsertime/pull/1970)

## 17.12.1 - 2023-07-19
### Fixed
* Hmm, Chromedriver 115 doesn't seems to work on Mac so reverted to 114.

## 17.12.0 - 2022-07-19
### Added
* Chrome and Chromedriver 115. The Chrome team has changed the hosting of Chromedriver, so the logic for downloading Chromedriver has changed [#1967](https://github.com/sitespeedio/browsertime/pull/1967).

* If you collect the Chrome devtools trace using `--cpu` we will now also collect the number of elements that needs recalculate styles before FCP/LCP.[#1964](https://github.com/sitespeedio/browsertime/pull/1964).

## 17.11.2 - 2023-06-19
### Fixed
* Fix --debug mode. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1959](https://github.com/sitespeedio/browsertime/pull/1959).
* Update ff-test-bidi-har-export to 0.0.11 that fixes some error logs [#1961](https://github.com/sitespeedio/browsertime/pull/1961).

## 17.11.1 - 2023-06-12
### Fixed
* If Chrome do not collect largest contentful paint, log that instead of just log null [#1957](https://github.com/sitespeedio/browsertime/pull/1957).

## 17.11.0 - 2023-06-01
### Fixed
* Fixed broken Docker auto build that skipped adding Docker manifest file.

### Added
* Use Chrome ane Chromedriver 114.

## 17.10.2 - 2023-05-26
### Fixed
* Fix for --host-resolver-rules, thank you [Mikhail](https://github.com/atuchin-m) for PR [#1953](https://github.com/sitespeedio/browsertime/pull/1953).

## 17.10.1 - 2023-05-19
### Fixed
* Updated code to collect Interaction To Next Paint [#1952](https://github.com/sitespeedio/browsertime/pull/1952). This new version follow updated version(s) of Google Web Vitals.

## 17.10.0 - 2023-05-19

### Added
* Chrome, Edge and Firefox 113 [#1946](https://github.com/sitespeedio/browsertime/pull/1946), Chromedriver 113 [#1947](https://github.com/sitespeedio/browsertime/pull/1947) and Edgedriver 113 [#1949](https://github.com/sitespeedio/browsertime/pull/1949).

### Fixed
* Bugfix for running iPhone Siumlator (and run tests on latest Mac OS) [#1945](https://github.com/sitespeedio/browsertime/pull/1945).
* Bumped dependencies for Selenium, yargs and jimp [#1950](https://github.com/sitespeedio/browsertime/pull/1950).

## 17.9.0 - 2023-04-19
### Added
* New command to start geckoprofiling when scripting using Firefox. Thank you [KS](https://github.com/92kns) for PR [#1934](https://github.com/sitespeedio/browsertime/pull/1934). This is probably only something you need if you work at Mozilla. There's also a follow PR [#1940](https://github.com/sitespeedio/browsertime/pull/1940) that fixes some of the issues I've been wanted to fix with the Geckoprofiler code.

* Use `--enableProfileRun` to make one extra run where metrics aren't collected but Geckoprofiler or Chromes timeline log is turned on. This useful if you are worrying about the trace causing overhead, but you still wan trace from the test/journey. It's a little rough at the moment so it will a follow up in the future [#1943](https://github.com/sitespeedio/browsertime/pull/1943).

### Fixed
* Bump Chrome remote interface and execa [#1941](https://github.com/sitespeedio/browsertime/pull/1941).

## 17.8.1 - 2023-04-12
### Fixed
* Upgraded to Firefox HAR 0.0.10 [#1939](https://github.com/sitespeedio/browsertime/pull/1939). 
## 17.8.0 - 2023-04-11
### Fixed
* Upgraded to Firefox HAR 0.0.8 [#1937](https://github.com/sitespeedio/browsertime/pull/1937). 

### Added
* Upgraded to Firefox 112 in the Docker container.
## 17.7.0 - 2023-04-07
### Added
* Added Edge/Edgedriver 112.

## 17.6.0 - 2023-04-05
### Fixed
* Increased the default wait time from 2 to 5 seconds when a element a clicked and the page complete check runs [#1931](https://github.com/sitespeedio/browsertime/pull/1931)

### Added
* Upgraded to Chrome/Chromedriver 112 in the Docker container [#1932](https://github.com/sitespeedio/browsertime/pull/1932).
* If you use `--headless` Chrome will use the new headless switch [#1933](https://github.com/sitespeedio/browsertime/pull/1933).

## 17.5.0 - 2023-04-04

### Added
* There's a new better way to get the HAR from [Firefox using WebDriver BiDi network events](https://github.com/firefox-devtools/bidi-har-export). Thank you [Julian Descottes](https://github.com/juliandescottes) and others at Mozilla that made this happen! With the new version we hope to see less overhead getting the HAR +  it works on Firefox on Android [#1918](https://github.com/sitespeedio/browsertime/pull/1918). You can turn it on with `--firefox.bidihar`.
* Updated to Geckodriver 0.33 [#1928](https://github.com/sitespeedio/browsertime/pull/1928).

### Fixed
* Fixed the interaction to next paint error message that started to appear in latest Chrome [#1924](https://github.com/sitespeedio/browsertime/pull/1924).
* Safer check for getting last meaningful paint  [#1927](https://github.com/sitespeedio/browsertime/pull/1927)

## 17.4.0 - 2023-03-29
### Added
* Log the CPU benchmark metric to the console. This is useful (at least for me) when debugging instances with a lot of instability. [#1920](https://github.com/sitespeedio/browsertime/pull/1920).
* In Chrome 111 some metrics become more instable when running on host with limited CPU. This change also exists in 112 beta. However we where missing out on a couple of command line magic to disable features in Chrome, this fixes that [#1921](https://github.com/sitespeedio/browsertime/pull/1921).

## 17.3.0 - 2023-03-26

### Fixed
* Bumped Selenium-webdriver to 4.8.2 [#1916](https://github.com/sitespeedio/browsertime/pull/1916).

### Added
* On Linux you can use taskset to assing FFMPEG to specific CPUs using `--videoParams.taskset "0,5,7,9-11" `. It will start FFMPEG with `taskset -c <CPUS>` to pin FFMPG to specific CPU(s). Specify a numerical list of processors. The list may contain multiple items, separated by comma, and ranges. For example, "0,5,7,9-11". Use it together with isolcpus. Added in [#1917](https://github.com/sitespeedio/browsertime/pull/1917).

* If you use a rooted Samsung A51 you can now choose the CPU speed (min/middle/max) using `--android.pinCPUSpeed min|middle|max` [#1915](https://github.com/sitespeedio/browsertime/pull/1915).
## 17.2.1 - 2023-03-16
### Fixed
* Bumped Geckodriver to 0.32.2 and Edgedriver to 111.

## 17.2.0 - 2023-03-14
### Added 
* Updated Chrome, Chromedriver, Edge and Firefox to 111.

## 17.1.1 - 2023-03-04
### Fixed
* Updated  jimp, yargs, webdriver, execa and chrome-remote-interface dependencies [#1909](https://github.com/sitespeedio/browsertime/pull/1909).
* Added extra log message when using the package.json hack.

## 17.1.0 - 2023-02-24

### Added
* Expose chrome-remote-interface client to scripting. This makes it so much easier to run whatever CDP command. Get the raw version `commands.cdp.getRawClient();`. See PR [#1905](https://github.com/sitespeedio/browsertime/pull/1905) for a concrete example until we update the documentation.
### Fixed
* Fix visual-complete progress calculations to not use fuzz/slop, thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1902](https://github.com/sitespeedio/browsertime/pull/1902).
* Update to new Chrome HAR [#1906](https://github.com/sitespeedio/browsertime/pull/1906).
* Fix flushing DNS on Ubuntu 22.04 [#1907](https://github.com/sitespeedio/browsertime/pull/1907).
## 17.0.0 - 2023-02-10

### Breaking changes
The project was transitioned to a [pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) [#1859](https://github.com/sitespeedio/browsertime/pull/1859), allowing us to stay current with dependencies that have made the same transition and ensuring the ability to always utilize the latest versions of our dependencies. This is important for us and will make the project easier to maintain.


#### CLI users
If you are a command line user and use scripting, you will need to do a change to your scripts or add a extra configuration. 

The new browsertime version treat all JavaScript files that ends with *.js* as ESM modules, that means your old script files will not work out of the box. There's a couple of fixes for that:

**The best fix**:
Change your code so your scripts also follows ESM package. If you have simple scripts you probably just need to change your exports. The old way looked like this:

```
module.exports = async function(context, commands) {
...
}
```

change that to:
```
export default async function (context, commands) {
...
}
```

If you have more complicated scripts, follow the [ESM package guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). 

This is the best fix and will woirk 100% of the time.

**The quick fix**: Rename your *.js* to *.cjs* that way NodeJS will treat your file as a common JS file and everything will just work. For example if you have a file names `login.js` you can rename that to `login.cjs` and make sure you load that new file.

**Another quick fix alternative**: As a last alternative add `--cjs` as a parameter to your test. That way the scripting file will be treated as a commonjs file. This is a hack, so to make sure it works, the user that runs Browsertime need to have write privileges to the folder where you have your scripting files. Browsertime will create a package.json file on the same levels as yoru script file. If you already have a package.json there, it will be overwritten.

#### Non cli users 
If you import Browsertime in NodeJS we changed how you do your import.

If you use ES modules you can import Browsertime like this:
```JavaScript
import { BrowsertimeEngine } from 'browsertime';
const engine = new BrowsertimEngine(options);
```

If you are still on CommonJS:
```JavaScript
const { BrowsertimeEngine } = await import ('browsertime');
const engine = new BrowsertimEngine(options);
```

Read [Sindre Sorhus Pure ESM package guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) on how you can move your project.

* We moved to use a new [Visual Metrics script](https://github.com/sitespeedio/browsertime/blob/main/browsertime/visualmetrics-portable.py) as default contributed by [Gregory Mierzwinski](https://github.com/gmierz) that do _not_ use ImageMagick. Mozilla has used this script for many months and we have internally used it in our test infrastructure since it was first released.

If you run Browsertime direct using NodeJs (and not using Docker) you need to install two new Python dependencies `OpenCV-Python Numpy`.

```
python -m pip install --user OpenCV-Python Numpy
```

This is pretty cool because it makes dependencies easier to install on all platforms + the script has also been cleaned up so its easier for us to maintain. 

### Added
* Selenium 4.8.
* Updated dependencies: execa, days, find-up, get-ports, jimp, yargs [#1860](https://github.com/sitespeedio/browsertime/pull/1860)
* Updated to Chrome, Firefox and Edge 109 in the Docker container. Also updated all drivers.
* Updated to NodeJS 18 and Ubuntu 22.04 in the Docker container.
* Get CPU metrics using Glean on Firefox, thank you [afinder-mozilla](https://github.com/afinder-mozilla) for PR [#1875](https://github.com/sitespeedio/browsertime/pull/1875)
* Provide active tab id to gecko profiler StartProfiler API in Firefox, thank you [Nazım Can Altınova](https://github.com/canova) for PR [#1874](https://github.com/sitespeedio/browsertime/pull/1874).
* There's two new methods to switch to frame: `switch.toFrameByXpath(xpath)` and `switch.toFrameBySelector(selector)` [#1880](https://github.com/sitespeedio/browsertime/pull/1880).
* Add a timeout to gecko profiler gzipping phase, thank you [Nazım Can Altınova](https://github.com/canova) for PR [#1896](https://github.com/sitespeedio/browsertime/pull/1896)
* Pin CPU freq to fastest for Samsung A51 (if you have a rooted device) [#1895](https://github.com/sitespeedio/browsertime/pull/1895).
### Fixed
* Pause the gecko profiler before starting to collect the profile data, thank you [Nazım Can Altınova](https://github.com/canova) for PR [#1856](https://github.com/sitespeedio/browsertime/pull/1856).

* All Android configurations has been moved to an Android group. That makes it easier when you run --help and can see all Android configuration grouped together. For example `--androidBatteryTemperature` is now `--android.batteryTemperatureLimit`. Old names will still work but are deprecated [#1865](https://github.com/sitespeedio/browsertime/pull/1865).

* Updated to Chromedriver 110 to work with Android 13 [#1894](https://github.com/sitespeedio/browsertime/pull/1894).

## 16.17.0 - 2022-09-27
### Added
* Add ability to ignore shutdown failures on android, thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1850](https://github.com/sitespeedio/browsertime/pull/1850).
* Updated to Firefox 105 and Edge 105 in the Docker container.

### Fixed
* Fix so we collect battery temperature statistics on Android (again) [#1851](https://github.com/sitespeedio/browsertime/pull/1851).

## 16.16.0 - 2022-09-20
### Added
* Chrome 105, Firefox 104 and Chromedriver 105 [#1843](https://github.com/sitespeedio/browsertime/pull/1843).
* Before you start a test on Android you can push the home button using `--androidPretestPressHomeButton` [#1844](https://github.com/sitespeedio/browsertime/pull/1844).

## 16.15.1 - 2022-08-30
### Fixed
* Make sure long tasks are collected direct after a test ends. On a slow device it sometimes happened that long tasks was browsertime running scripts to collect metrics [#1841](https://github.com/sitespeedio/browsertime/pull/1841).
## 16.15.0 - 2022-08-30
### Added
* Always get the wifi name that your Android phone is using and add it to the result [#1839](https://github.com/sitespeedio/browsertime/pull/1839).

## 16.14.2 - 2022-08-26
### Fixed
* Using `--preWarmServer` didn't work on Android/iOS [#1837](https://github.com/sitespeedio/browsertime/pull/1837).
## 16.14.1 - 2022-08-26
### Fixed
* Guard relative standard deviation agains 0 standard deviation [#1835](https://github.com/sitespeedio/browsertime/pull/1835).
## 16.14.0 - 2022-08-26
### Added
* Collect relative standard deviation and output that in the cli output [#1834](https://github.com/sitespeedio/browsertime/pull/1834). Before we only showed the actual standard deviation, with this fix we also show it in percentage, that makes it easier if you run tests on different hardware/networks and want to compare them.
* Collect number of processes that runs on the server that do the testing, before a test starts [#1833](https://github.com/sitespeedio/browsertime/pull/1833).

### Fixed
* Updated to Selenium 4.4.0 and Throttle 5.0.0.
## 16.13.3 - 2022-08-17

### Fixed
* Make sure set cookies work when navigating in script for Chrome/Edge [#1830](https://github.com/sitespeedio/browsertime/pull/1830).

## 16.13.2 - 2022-08-14
### Fixed
* Disable adding lastCPULongTask to the HAR data since it breaks waterfall view on slow mobile phones with late CPU long tasks [#1828](https://github.com/sitespeedio/browsertime/pull/1828).

## 16.13.1 - 2022-08-10
### Fixed
* Make sure that Android id is always picked up from the phone if tests run on Android [#1826](https://github.com/sitespeedio/browsertime/pull/1826).

## 16.13.0 - 2022-08-08
### Added
* Upgraded to Edgedriver 104.

### Fixed
* Upgraded to Selenium 4.3.1 [#1824](https://github.com/sitespeedio/browsertime/pull/1824).
* Upgraded Chrome reomte interface to 0.31.3 [#1825](https://github.com/sitespeedio/browsertime/pull/1825)
## 16.12.0 - 2022-08-06
### Added
* Upgraded to Chrome 104, Edge 104, Firefox 103 in the Docker container.
* Upgraded to Chromedriver 104.

### Fixed
* Remove old Firefox on Android workaround for orange frame [#1821](https://github.com/sitespeedio/browsertime/pull/1821), thank you [Sean Feng](https://github.com/sefeng211) for the PR.

## 16.11.4 - 2022-07-17
### Fixed
* Automatically add white background between --preURL and the URL that you wanna test. This makes visual metrics usable when using preURL. [#1819](https://github.com/sitespeedio/browsertime/pull/1819)

## 16.11.3 - 2022-07-14

### Fixed
* If one of the visual elements failed, all failed. Fixed in [#1818](https://github.com/sitespeedio/browsertime/pull/1818).
* Use buffered long tasks instead of injecting the measuremnt in the page [#1817](https://github.com/sitespeedio/browsertime/pull/1817).
* Fixed broken CHromedriver and Geckodriver install on Windows.

## 16.11.2 - 2022-07-05
### Fixed
* Updated Geckodriver install, it will autoamtically pickup Geckodriver in the path for Raspberry Pis.
## 16.11.1 - 2022-06-29
### Fixed
* Fixed `--preWarmServer` so it works with `--headless`, Docker and specific Android or iOS device [#1815](https://github.com/sitespeedio/browsertime/pull/1815).
## 16.11.0 - 2022-06-28

### Added 
* Firefox 102 and Edge 103 in the Docker container.
* Use Edgedriver 103 [#1812](https://github.com/sitespeedio/browsertime/pull/1812)
### Fixed
* Upgraded to Selenium 4.3.0 [#1813](https://github.com/sitespeedio/browsertime/pull/1813).

## 16.10.1 - 2022-06-26

### Fixed
* Verify that the CDP port is free before using it [1811](https://github.com/sitespeedio/browsertime/pull/1811).

## 16.10.0 - 2022-06-23
### Added
* Upgraded the Docker container to use Chrome 103.
* Upgraded to Chromedriver 103.

## 16.9.1 - 2022-06-19

### Fixed
* Upgraded to Throttle 4 that internally uses `ip route` instead of `route` (one less dependency) [#1767](https://github.com/sitespeedio/browsertime/pull/1767).
## 16.9.0 - 2022-06-15
### Added
* New `wait.byCondition` command. Thank you [Icecold777](https://github.com/Icecold777) for PR [#1803](https://github.com/sitespeedio/browsertime/pull/1803).
* Collect number of CPU longtasks before largest contentful paint [#1806](https://github.com/sitespeedio/browsertime/pull/1806).

### Fixed
* Instead of throwing errors and exit the tests if the page hasn't finished loading after 5 minutes, we now gracefully ends the test after 2 minutes (you can change that time with `--maxLoadTime`). That makes more sense than just throwing errors [#1810](https://github.com/sitespeedio/browsertime/pull/1810). 
##  16.8.1 - 2022-06-09
### Fixed
* Fix for getting the MOZ log, thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1802](https://github.com/sitespeedio/browsertime/pull/1802).
* [Removed unused functionality of the Visual metrics portable script](https://github.com/sitespeedio/browsertime/pull/1751).
##  16.8.0 - 2022-06-06
### Added
* Add `--debug` mode. Debug mode will run your tests and open devtools in Chrome/Edge/Firefox on desktop and will stop after each iteration so you can inspect the page. You can add your own breakpoint in your script with the `breakpoint(name)` command. To continue after your breakpoint, add the following code in the developer console in your browser: `window.browsertime.pause=false;`  [#1798](https://github.com/sitespeedio/browsertime/pull/1798).
* Use Selenium WebDriver 4.2.0 [#1801](https://github.com/sitespeedio/browsertime/pull/1801).
* Updated to Firefox 101, Edge 102, Chrome 102 in the Docker container.

### Tech
* Added tests using NodeJS 18 [#1772](https://github.com/sitespeedio/browsertime/pull/1772).
## 16.7.0 - 2022-05-20
### Added
* Include last CPU long task in the HAR file so we can show when it happens [#1793](https://github.com/sitespeedio/browsertime/pull/1793).
* Inlclude TTFB and INP in the Google Web Vital namespace [#1792](https://github.com/sitespeedio/browsertime/pull/1792).
## 16.6.0 - 2022-05-20
### Added
* Implemented experimental Interaction to next paint that's useful if you test user journeys [#1791](https://github.com/sitespeedio/browsertime/pull/1791).
* Track when the last CPU long task happen as explained by Andy Davies of the webperf Slack channel [#1789](https://github.com/sitespeedio/browsertime/pull/1789).

## 16.5.0 - 2022-05-11
### Added
* Make it possible to configure the max size in pixels for the filmstrip screenshots using `--videoParams.thumbsize` [#1787](https://github.com/sitespeedio/browsertime/pull/1787).

### Fixed
* Handle all boundaries when cropping image in portable script, thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1788](https://github.com/sitespeedio/browsertime/pull/1788).
## 16.4.0 - 2022-05-11
### Added
* If we have the Largest Contentful Paint for the video, add that to the video text instead of DOMContentLoaded [#1783](https://github.com/sitespeedio/browsertime/pull/1783).

### Fixed
* Only get LCP in Visual Metrics if the LCP API gives us a element [#1786](https://github.com/sitespeedio/browsertime/pull/1786).
## 16.3.0 - 2022-05-07
### Added
* If you use `--visualElements` and the browser supports the Largest Contentful API, we also record 
the LCP from the video. This will help the Chrome team and other browser teams to get it right (see [https://bugs.chromium.org/p/chromium/issues/detail?id=1291502](https://bugs.chromium.org/p/chromium/issues/detail?id=1291502)) [#1782](https://github.com/sitespeedio/browsertime/pull/1782).

## 16.2.2 - 2022-05-06
### Fixed
* The Docker container uses Ubuntu 20 again (instead of 22) since there's been multiple problems (running on ARM and on some cloud services).

## 16.2.1 - 2022-05-04

### Fixed
* Add an acceptable error of 5 pixels to last frame matches for the visual metric portable script, thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1780](https://github.com/sitespeedio/browsertime/pull/1780).
## 16.2.0 - 2022-05-01
### Added
* Updated to Chrome and Chromedriver 101 [#1773](https://github.com/sitespeedio/browsertime/pull/1773).
* Updated to Edge and Edgedriver 101 [#1778](https://github.com/sitespeedio/browsertime/pull/1778).
* Use Geckodriver 0.31.0 [#1775](https://github.com/sitespeedio/browsertime/pull/1775).
* Added new alias for warm cache load. You can now use either `--preURL` or `--warmLoad` [#1774](https://github.com/sitespeedio/browsertime/pull/1774).

### Fixed
* Updated to Selenium 4.1.2 [#1779](https://github.com/sitespeedio/browsertime/pull/1779).
### Tech
* Updated dev dependencies [#1776](https://github.com/sitespeedio/browsertime/pull/1776).
## 16.1.0 - 2022-04-20
### Fixed
* Handle negative x/y offsets when cropping images in the new portable visual metrocs script, thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1770](https://github.com/sitespeedio/browsertime/pull/1770).
* Bumped Throttle dependency [#1769](https://github.com/sitespeedio/browsertime/pull/1769).
* Bumped chrome-har, chrome-remote-interface, dayjs and yargs dependencies [#1771](https://github.com/sitespeedio/browsertime/pull/1771).
### Added
* Added blocking of Chrome and Edge phone home domains [#1763](https://github.com/sitespeedio/browsertime/pull/1763).

## 16.0.1 - 2022-04-06
### Fixed
* If visual metrics fails and you also use --visualElements, make sure that file is also stored so we can reporduce the issue [#1757](https://github.com/sitespeedio/browsertime/pull/1757).
## 16.0.0 - 2022-04-05
### Changed
* When I introduced flushing of the DNS per run I missed that it makes you need to run sudo to do it (Mac/Linux). That sucks so instead of being able to disable the flushing `--disableDNSFlush` you now enables it with `--flushDNS` [#1752](https://github.com/sitespeedio/browsertime/pull/1752).

### Added 
* Firefox 99 in the Docker container
* Edge and Edgedriver 100

### Fixed
* Automatically save the original video if visual metrics fails [#1755](https://github.com/sitespeedio/browsertime/pull/1755).

## 15.4.0 - 2022-03-30
### Added
* Updated to Chrome and Chromedriver 100 [#1743](https://github.com/sitespeedio/browsertime/pull/1743).
* There's a new version of the visual metrics script contributed by [Gregory Mierzwinski](https://github.com/gmierz) that removed the dependency of ImageMagick and instead needs the Python dependencies *OpenCV-Python* and *Numpy*. The long term goal is to use this as default but for now you can test it with `--visualMetricsPortable`.

## 15.3.0 - 2022-03-07
### Added
* Chrome: If you set --user-data-dir you can clean the directory between each iteration using `--chrome.cleanUserDataDir` [#1739](https://github.com/sitespeedio/browsertime/pull/1739)


## 15.2.0 - 2022-03-04
### Added
* Updated to Chromedriver and Edgedriver 99.
* Updated Docker container to use Chrome and Edge 99 [#1738](https://github.com/sitespeedio/browsertime/pull/1738).

### Fixed
* Added more view ports for emulated mobile in Chrome [#1736](https://github.com/sitespeedio/browsertime/pull/1736).
## 15.1.1 - 2022-02-24
### Fixed
* Updated Chromedriver dependency that fixes installation on M1 and [some send keys issues](https://chromedriver.storage.googleapis.com/98.0.4758.102/notes.txt). 
## 15.1.0 - 2022-02-24
### Added
* Collect timings from main document. The result includes a field named mainDocumentTimings and contains blocked, dns, connect, send, wait, receive, ssl as long as you get a HAR file from the browser [#1735](https://github.com/sitespeedio/browsertime/pull/1735).

### Tech
* Cleaned the DNS flush code [#1734](https://github.com/sitespeedio/browsertime/pull/1734).
## 15.0.1 - 2022-02-21
### Fixed
* Make sure connectivity is only set before the test begins [#1733](https://github.com/sitespeedio/browsertime/pull/1733).
## 15.0.0 - 2022-02-20
### Changed
* Removed the built in support for TSProxy [#1718](https://github.com/sitespeedio/browsertime/pull/1718). TSProxy only worked with Python 2.7 and we want to remove that dependency.
* Removed support for using speedline and the CLI arg `--chrome.visualMetricsUsingTrace` [#1727](https://github.com/sitespeedio/browsertime/pull/1727).

### Fixed
* Code cleanup: [#1720](https://github.com/sitespeedio/browsertime/pull/1720)
* Moved test to [Ava](https://avajs.dev) instead of mocha and moved most testing against a local HTTP server instead of internet [#1725](https://github.com/sitespeedio/browsertime/pull/1725).

### Added
* New alias for getting the Chrome trace log: `--chrome.trace` [#1728](https://github.com/sitespeedio/browsertime/pull/1728).
* On OS X and Linux the DNS will be flushed between runs. You can disable that with `--disableDNSFlush true` [#1732](https://github.com/sitespeedio/browsertime/pull/1732).
## 14.21.1 - 2022-02-09
### Fixed
* Always disable the new ChromeWhaxyNewUI splash screen in Chrome [#1717](https://github.com/sitespeedio/browsertime/pull/1717).
* Remove the Firefox persist log configuration that was needed for FF 94+ [#1716](https://github.com/sitespeedio/browsertime/pull/1716).
## 14.21.0 - 2022-02-08
### Added
* Upgraded to Egdedriver 98
* Upgraded to Edge 98 and Firefox 97 in the Docker container
## 14.20.3 - 2022-02-07
### Fixed
* There's a new setup how we build Docker releases and this release uses the new pipeline.
## 14.20.0 - 2022-02-07
### Added
* Docker container for both amd64 and arm64.

## 14.19.2 - 2022-02-05
### Fixed
* Upgraded to Geckodriver 0.30.0 [#1710](https://github.com/sitespeedio/browsertime/pull/1710).
* Upgraded to Chromedriver that always looks for Chromedriver in PATH for arm64.
* Fixed getting Geckoprofile on Android when you do not specify Android package [#1712](https://github.com/sitespeedio/browsertime/pull/1712).
## 14.19.1 - 2022-02-03
### Fixed
* Remove the old fix for setting CPUThrottling, that works now in Chrome without that fix [#1708](https://github.com/sitespeedio/browsertime/pull/1708).
* Do not set binary for Firefox when run on Android [#1706](https://github.com/sitespeedio/browsertime/pull/1706).

## 14.19.0 - 2022-02-02

### Added 
* Chrome and Chromedriver 98 [#1704](https://github.com/sitespeedio/browsertime/pull/1704).

### Fixed
* Fix so we get the Firefox version on Android [#1704](https://github.com/sitespeedio/browsertime/pull/1704).

## 14.18.1 - 2022-01-24
### Fixed
* If loading a URL failed and we retry and we logged that as an info message, but you as a user only need to know if it fails after X retries. The log message now logs at debug level [#1701](https://github.com/sitespeedio/browsertime/pull/1701).
* The summary log message `[2022-01-24 16:12:38] INFO: https://www.sitespeed.io 27 requests, TTFB: 962ms (σ917.00ms), firstPaint: 2.92s (σ3.07s), firstVisualChange: 2.94s (σ3.07s), FCP: 2.92s (σ3.07s), DOMContentLoaded: 3.22s (σ2.98s), LCP: 2.92s (σ3.07s), CLS: 0.0389 (σ0.03), TBT: 769ms (σ53.00ms), Load: 3.77s (σ3.12s), speedIndex: 2.96s (σ3.07s), visualComplete85: 2.95s (σ3.06s), lastVisualChange: 4.54s (σ3.30s) (21 runs)` that summaries all the runs used mean instead of median metric. That sucks when you do many runs and want to compare them. That is now fixed to show median number instead [#1700](https://github.com/sitespeedio/browsertime/pull/1700).

## 14.18.0 - 2022-01-24
### Added
* Updated to Edge stable in the Docker container.

### Fixed
* A more safe way to get dockumentURI for Firefox. See PR [#1699](https://github.com/sitespeedio/browsertime/pull/1699) and bug [#1698](https://github.com/sitespeedio/browsertime/issues/1698).

## 14.17.0 - 2022-01-23
### Added
* New Select command [#1696](https://github.com/sitespeedio/browsertime/pull/1696):
  * `select.selectByIdValue(selectId, value)`
  * `select.selectByNameAndValue(selectName, value)`
  * `select.selectByIdAndIndex(selectId, index)`
  * `select.selectByNameAndIndex(selectName, index)`
  * `select.deselectById(selectId)`
  * `select.getValuesById(selectId)`
  * `select.getSelectedValueById(selectId)`

* New click by name command `click.byName(name)` [#1697](https://github.com/sitespeedio/browsertime/pull/1697).

### Fixed
* Remove the top 10 rows of the image to handle progress bars on some mobile browser recordings. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1687](https://github.com/sitespeedio/browsertime/pull/1687). 

##  14.16.0 - 2022-01-14
### Added 
* Upgraded Geckodriver downloader that downloads a pre-built Geckodriver on Raspberry Pis.

## 14.15.0 - 2022-01-12
### Added
* Added so you can append a String to Firefox User Agent [#1694](https://github.com/sitespeedio/browsertime/pull/1694), thank you [Henrik Skupin](https://github.com/whimboo) for pointing me in the right direction. With [#1695](https://github.com/sitespeedio/browsertime/pull/1695) we now have `--appendToUserAgent` that works in Chrome/Edge and Firefox.
## 14.14.1 - 2022-01-12
### Fixed
* Updated Chromedriver library that pickup already installed driver on Raspberry Pis. This makes it easier to run tests on an Android device from a Raspberry Pi.
## 14.14.0 - 2022-01-10
### Added
* Add support for [Humble](https://calendar.perfplanet.com/2021/introducing-humble-the-raspberry-pi-wifi-network-link-conditioner/) as connectivity engine for mobile phone testing. Make sure to setup Humble on a Raspberry Pi 4 and the choose engine with `--connectivity.engine humble` and set the URL to your instance `--connectivity.humble.url http://raspberrypi.local:3000`. Added in [#1691](https://github.com/sitespeedio/browsertime/pull/1691).
* Upgraded to Chrome 97, Edge 97 and Firefox 95 in the Docker container.
* Upgraded to Chromedriver 97.

## 14.13.1 - 2022-01-01
### Fixed
* Added missing `--chrome.appendToUserAgent` in the CLI help.

## 14.13.0 - 2021-12-30
### Added
* Append text to Chrome/Edge user agent using `--chrome.appendToUserAgent` [#1688](https://github.com/sitespeedio/browsertime/pull/1688).

### Fixed
* When you use Chrome and use a "emulated device" that will use the user agent that you provide using `--userAgent`[#1689](https://github.com/sitespeedio/browsertime/pull/1689).
## 14.12.2 - 2021-12-09
### Fixed
* Added more info log to get a better feeling for what's going on [#1686](https://github.com/sitespeedio/browsertime/pull/1686).
* Fixed CPU throttling that was broken in Chrome 96 [#1685](https://github.com/sitespeedio/browsertime/pull/1685)
## 14.12.1 - 2021-12-01
### Fixed
* Changed log level to debug for Chrome/Edge when document request fails. It turns out that IRL that happens a lot and spam the log. Lets iterate over that functionality.
## 14.12.0 - 2021-11-30
### Fixed
* Adding error log message for Chrome/Edge when document request fails (faulty domain etc) [#1682](https://github.com/sitespeedio/browsertime/pull/1682).
* Added `'devtools.netmonitor.persistlog': true` preference for Firefox to fix the HAR issue introduced in Firefox 94 [#1684](https://github.com/sitespeedio/browsertime/pull/1684).

### Added
* Updated to Firefox 94 in the Docker image.
## 14.11.0 - 2021-11-23
### Fixed
* Use the viewport to determine if more cropping is needed in visual metrics. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1680](https://github.com/sitespeedio/browsertime/pull/1680).
### Added
* Updated to Selenium 4.1.0 [#1679](https://github.com/sitespeedio/browsertime/pull/1679) 

## 14.10.2 - 2021-11-20
### Fixed
* Disabled the version check for Edge/Edgedriver in Edgedriver [#1678](https://github.com/sitespeedio/browsertime/pull/1678).

## 14.10.1 - 2021-11-19
### Fixed
* Disabled the automatic Chrome/Chromedriver version check in Chromedriver [#1676](https://github.com/sitespeedio/browsertime/pull/1676).
* Loop until we find a frame with a good viewport or until we run out of retries for Visual Metrics. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1668](https://github.com/sitespeedio/browsertime/pull/1668). 

## 14.10.0 - 2021-11-16
### Added
* Updated to Chromedriver 96 and Chrome 96 in the Docker container [#1670](https://github.com/sitespeedio/browsertime/pull/1670).

### Fixed
* Added checks for Firefox HAR that it actually has a page.
* Updated day js.

## 14.9.0 - 2021-11-07
### Added
* Updated to new Chome HAR PR [#1666](https://github.com/sitespeedio/browsertime/pull/1666) that inlcudes chunk information.

### Fixed
* Updated to yargs 17.2.1 [#1667](https://github.com/sitespeedio/browsertime/pull/1667).
## 14.8.0 - 2021-10-27
### Added
* New Edgedriver 95 and Edge 95 in the Docker container [#1665](https://github.com/sitespeedio/browsertime/pull/1665).

### Fixed
* Fix for storing Firefox memory report and geckoprofile on Android 10+. Thank you [Andrew Creskey](https://github.com/acreskeyMoz) for PR [#1663](https://github.com/sitespeedio/browsertime/pull/1663).

## 14.7.0 - 2021-10-20
### Added
* Updated to Chromedriver 95. Added Chrome 95 in the Docker container.

## 14.6.1 - 2021-10-18
### Fixed
* If loading the URL fails (we get an exception, the browser crashes etc) make sure we stop the video correctly so it can be used [#1657](https://github.com/sitespeedio/browsertime/pull/1657).


## 14.6.0 - 2021-10-13
### Added
* Updated to Selenium 4.0.0 [#1655](https://github.com/sitespeedio/browsertime/pull/1655).
* You can skip setting Browsertime default Firefox preferences with `--firefox.noDefaultPrefs`, thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1650](https://github.com/sitespeedio/browsertime/pull/1650).
* You can skip setting Browsertime default Chrome options with `--chrome.noDefaultOptions`, fixed in [#1651](https://github.com/sitespeedio/browsertime/pull/1651).
* Updated to Firefox 93 in the Docker container.

### Fixed
* Updated eslint and prettier dependencies [#1652](https://github.com/sitespeedio/browsertime/pull/1652).
* Log Firefox preference and Chrome args on debug level [#1654](https://github.com/sitespeedio/browsertime/pull/1654)
## 14.5.0 - 2021-09-30
### Added
* Added CSS selector support for mouse commands [#1645](https://github.com/sitespeedio/browsertime/pull/1645) 

### Fixed
* Internal refactoring of the mouse command [#1646](https://github.com/sitespeedio/browsertime/pull/1646) and [#1647](https://github.com/sitespeedio/browsertime/pull/1647).

## 14.4.0 - 2021-09-22
### Added
* Updated to Ch
romedriver 94 and Chrome 94 in the Docker container [#1643](https://github.com/sitespeedio/browsertime/pull/1643).
## 14.3.0 - 2021-09-16
### Added
* Update to Edgedriver 93. Update to Edge 93 in the Docker container [#1641](https://github.com/sitespeedio/browsertime/pull/1641).
* Updated to a new fresh WebPageReplay version in the Docker container [#1635](https://github.com/sitespeedio/browsertime/pull/1635)

### Fixed
* Enabling verbose logging (-vv and higher) with Chrome, broke tests. Fixed in [#1640](https://github.com/sitespeedio/browsertime/pull/1640).

## 14.2.1 - 2021-09-06

### Fixed
* Updated Geckodriver dependency that uses a newer version of the tar-package.
## 14.2.0 - 2021-09-04
### Added
* Updated to Selenium 4.0.0-RC1 [#1631](https://github.com/sitespeedio/browsertime/pull/1631).
### Fixed
* Somehow Throttle has been degraded, with this fix we are back to using 3.0.0.

## 14.1.0 - 2021-09-01
### Added
* Updated to Chromedriver 93 and added Chrome 93 in the Docker container [#1630](https://github.com/sitespeedio/browsertime/pull/1630).

## 14.0.3 - 2021-08-31
### Fixed
* Catch if Chrome is missing FCP [#1627](https://github.com/sitespeedio/browsertime/pull/1627).
* Better error message if we have a Chrome/Chromedriver miss match [#1628](https://github.com/sitespeedio/browsertime/pull/1628).
* Make sure only one trace listener is created for Chrome when we get a trace [#1629](https://github.com/sitespeedio/browsertime/pull/1629).
## 14.0.2 - 2021-08-20
### Fixed
* Removed that annoying extra line break in the log output [#1626](https://github.com/sitespeedio/browsertime/pull/1626).
* TTFB was reported as a string instead of a number in the JSON output [#1625](https://github.com/sitespeedio/browsertime/pull/1625).
## 14.0.1 - 2021-08-12
### Fixed
* More tuning to exclude the top browser bar when calculating visual metrics that fixes too early first visual change when testing emulated mobile using Chrome in Linux [#1623](https://github.com/sitespeedio/browsertime/pull/1623).
## 14.0.0 - 2021-08-12

### Changed
* Updated to Throttle 3.0 that do not set throttling on localhost by default on Mac OS. If you run test against a local server or use WebPageReplay on a Mac, you should add `--connectivity.throttle.localhost` to your test and it will work as before.
### Fixed
* Updated Throttle to 2.2.1 that fixes when two default interfaces are defined on Linux.
### Added
* Make it possible to set Chromdriver port, thank you [Saurav Kumar](https://github.com/svkrclg) for PR [#1620](https://github.com/sitespeedio/browsertime/pull/1620).
* Updated to Edge 92, Edgedriver 92 and Firefox 92 beta to get the fix for https://bugzilla.mozilla.org/show_bug.cgi?id=1712983 in the Docker container.

## 13.1.4 - 2021-07-28
### Fixed
* Increased the default URL bar size for visual metrics from 18 pixel to 20 pixel [#1619](https://github.com/sitespeedio/browsertime/pull/1619).

## 13.1.3 - UNRELEASED
* This release was broken because of bad internet connectivity.
## 13.1.2 - 2021-07-23
### Fixed
* Increased the default URL bar size for visual metrics from 10 pixel to 18 pixel [#1617](https://github.com/sitespeedio/browsertime/pull/1617).
## 13.1.1 - 2021-07-23

### Fixed
* Increased the extra wait time for orange to appear in the browser winrow when we record a video on desktop. Before we waited 400 ms, now we wait 800 ms [#1616](https://github.com/sitespeedio/browsertime/pull/1616).
## 13.1.0 - 2021-07-22
### Added
* Chrome introduced a bug in how we measure first visual change (see [#1614](https://github.com/sitespeedio/browsertime/issues/1614)). Adding support to better configuration for notification/viewport with [#1615](https://github.com/sitespeedio/browsertime/pull/1615).
## 13.0.0 - 2021-07-22

### Breaking changes
* With this release we drop support for NodeJs 10 (EOL ended some time ago).
### Added
* Updated the Docker container to use Chrome 92.
* Updated to Chromedriver 92.
* Upgrade to yargs 17 [#1600](https://github.com/sitespeedio/browsertime/pull/1600).

### Fixed
* Fixed so that browsertime-result dir isn't created if you set your own result dir. Thank you [Vicky Ledsom](https://github.com/ledleds) for PR [#1611](https://github.com/sitespeedio/browsertime/pull/1611).
## 12.11.0 - 2021-07-15
### Fixed
* Fixed so we support JavaScript that ends with a ; when you select an element for for clicking [#1610](https://github.com/sitespeedio/browsertime/pull/1610). See [#1606](https://github.com/sitespeedio/browsertime/issues/1606) and thank you [Vicky Ledsom](https://github.com/ledleds) for reporting.
* Fixed recording videos on new Mac M1 for emulated mobile. We used to have a hack for getting the right DPI but it seems like that didn't work on Mac M1 (depending on what screen you are using) [#1607](https://github.com/sitespeedio/browsertime/pull/1607).
### Added
* Added screen size for Moto G4 when you run Chrome as emulated mobile [#1608](https://github.com/sitespeedio/browsertime/pull/1608).
* Added Firefox 90 in the Docker container [#1609](https://github.com/sitespeedio/browsertime/pull/1609).

##  12.10.0 - 2021-07-05
### Fixed
* Update container to use NodeJS 14.7.1.
* Fix when LCP do not exist in Chrome [#1602](https://github.com/sitespeedio/browsertime/pull/1602).

### Added
* Add Firefox memory support to Browsertime. This will measure how much memory that is used. Turn on with `--firefox.memoryReport`. Thank you [dpalmeiro](https://github.com/dpalmeiro) for PR [#1601](https://github.com/sitespeedio/browsertime/pull/1601).

## 12.9.3 - 2021-06-24

### Fixed
* Reverted to yargs 16.2.0 since 17.X do not support NodeJS 10. Lets update to yargs 17 in next major.
## 12.9.2 - 2021-06-23
### Fixed
* Make sure video settings in activated on the iOS device before connecting with Safaridriver [#1597](https://github.com/sitespeedio/browsertime/pull/1597).
* Upgrade to chrome-remote-interface 0.30.1 [#1599](https://github.com/sitespeedio/browsertime/pull/1599)
* Use yargs 17.0.1 [#1595](https://github.com/sitespeedio/browsertime/pull/1595).
##  12.9.1 - 2021-06-09
### Fixed
* Finally a fix for driving Safari on iOS. Start/stop the Safaridriver manually, see [#1596](https://github.com/sitespeedio/browsertime/pull/1596). Video on iOS is broken though, see if we can find a fix for that too.
* Upgrade to use Selenium-4.0.0-beta.4 [#1592](https://github.com/sitespeedio/browsertime/pull/1592) and updated throttle, dayjs, execa and chrome-remote-interface to run latest versions [#1594](https://github.com/sitespeedio/browsertime/pull/1594). 
##  12.9.0 - 2021-06-04

### Added
* Use the [new definition](https://web.dev/evolving-cls/) of Cumulative Layout Shift [#1591](https://github.com/sitespeedio/browsertime/pull/1591).
* Include LCP info in the HAR so we later on can show LCP info in a har viewer [#1590](https://github.com/sitespeedio/browsertime/pull/1590).
* Pickup render blocking info from Chrome [#1586](https://github.com/sitespeedio/browsertime/pull/1586), this will be useful in Chrome 92.

### Fixed
* Fix broken store the perf log for Chrome to disk [#1585](https://github.com/sitespeedio/browsertime/pull/1585).
## 12.8.0 - 2021-06-02
### Added
* Updated the Docker container to use Firefox 89 and Edge 91.
* Updated to Edgedriver 91.
## 12.7.0 - 2021-05-26
### Added
* Include the HTML element when you get timings for visual elements with `--visualElements` [#1580](https://github.com/sitespeedio/browsertime/pull/1580). This makes it easier to debug.
* Updated to Chrome and Chromedriver 91 [#1583](https://github.com/sitespeedio/browsertime/pull/1583).
* Updated to Edge 90 in the Docker container
### Fixed
* Fixed the broken CPU throttling in Chrome (when you do not run headless). See [#1380](https://github.com/sitespeedio/browsertime/issues/1380) and [#1582](https://github.com/sitespeedio/browsertime/pull/1582).

* Fix broken getViewPort for Pixel 2 in mobile emulation, thank you [Radu Micu](https://github.com/radum) for PR [#1581](https://github.com/sitespeedio/browsertime/pull/1581).
## 12.6.1 - 2021-05-21
### Fixed
* Fixed adding cookies with equals sign in value. Thank you [sebguilbaud](https://github.com/sebguilbaud) for PR [#1578](https://github.com/sitespeedio/browsertime/pull/1578).
* Use data:text/html as orange screen for Safari as the rest of the browsers [#1579](https://github.com/sitespeedio/browsertime/pull/1579).
## 12.6.0 - 2021-05-12
### Added
* Configure a value/score limit of when to paint shifting elements in the Layout Shift screenshot. Use `--screenshotLSLimit`. Defaulyt is 0.01 [#1576](https://github.com/sitespeedio/browsertime/pull/1576).
* Include the LCP HTML tag in result [#1575](https://github.com/sitespeedio/browsertime/pull/1575).
## 12.5.0 - 2021-05-11
### Added
* Choose the color of the layout shift highlight in the screenshot by using `--screenshotLSColor` [#1573](https://github.com/sitespeedio/browsertime/pull/1573).
* Report the actual HTML for the Largest Contentful paint [#1572](https://github.com/sitespeedio/browsertime/pull/1572).

### Fixed
* Better reporting of layout shift [#1571](https://github.com/sitespeedio/browsertime/pull/1571). Add the domPath, the actual HTML of the shifted element and tuning of the coloring in the screenshot. Also make sure the time for the layout shift is reported.
* Catch if iOS simulator start/stop fails [#1569](https://github.com/sitespeedio/browsertime/pull/1569).
## 12.4.0 - 2021-05-02
### Fixed
* Safer checks to get LCP elements [#1568](https://github.com/sitespeedio/browsertime/pull/1568)

### Added
* Choose color how the LCP element is highlighted `--screenshotLCPColor` [#1567](https://github.com/sitespeedio/browsertime/pull/1567).
* First go at showing layout shifted elememnts in screenshot. Enable wth `--screenshotLS` [#1565](https://github.com/sitespeedio/browsertime/pull/1565).
## 12.3.1 - 2021-04-30
### Fixed
* The script that get more info about largest contentful paint was not optimal and had bugs and log messages. Fixed in [#1563](https://github.com/sitespeedio/browsertime/pull/1563).
## 12.3.0 - 2021-04-30

### Added
* Get a extra screenshot where the Largest Contentful Paint is highlighted `--screenshotLCP` and collect all elements in the LCP API [#1561](https://github.com/sitespeedio/browsertime/pull/1561) [#1562](https://github.com/sitespeedio/browsertime/pull/1562).

## 12.2.0 - 2021-04-27
### Fixed
* Fix broken "browser" category of script. Without the fix, it only worked in Firefox [#1558](https://github.com/sitespeedio/browsertime/pull/1558). That meant no user agent string, and width/height of the browser window.
* Removed getting the user agent string the pageinfo scripts, now when browser scripts work.

### Added
* Get the Safari version from the browser [#1556](https://github.com/sitespeedio/browsertime/pull/1556).
* Added simple browser cpu benchmark to run after metrics are collected [#1559](https://github.com/sitespeedio/browsertime/pull/1559).


##  12.1.0 - 2021-04-23
## Added
* Updated to Firefox 88 in the Docker container.
* New scroll to bottom command [#1552](https://github.com/sitespeedio/browsertime/pull/1552).
* Fixed so scroll to page command work in all browsers and not only Firefox [#1551](https://github.com/sitespeedio/browsertime/pull/1551).

### Fixed
* Added missing --disable-dev-shm-usage cli option for Chrome, fixes [sitespeed.io #3357](https://github.com/sitespeedio/sitespeed.io/issues/3357).
* Cleanup scrolling command [#1553](https://github.com/sitespeedio/browsertime/pull/1553).
## 12.0.1 - 2021-04-16
* With Chrome/Chromedriver 90 it seems to take longer time to close the browser than earlier versions, so when trying the next run, the previous browser is not closed [#1548](https://github.com/sitespeedio/browsertime/issues/1548) fixed in [#1549](https://github.com/sitespeedio/browsertime/pull/1549) by adding a 2 second sleep time before next try.

## 12.0.0 - 2021-04-15

Hi and welcome to the 12.0.0 release of Browsertime! Here's a list of what changed, what has been added and what has fixed. You can safely upgrade and please be aware that some metrics can change when you upgrade: We changed startup flags for Chrome and we made the "new" connectivity settings default (meaning 3g is faster than before and more realistic). Read more in each individual change.

A special thanks to [Inderpartap Singh Cheema](https://github.com/inderpartap), [Denis Palmeiro](https://github.com/dpalmeiro) and [Olaf Meeuwissen](https://github.com/paddy-hack) for their contributions to this release!

### Changed
* Display standard deviation instead of the home made median deviation in the cli output [#1529](https://github.com/sitespeedio/browsertime/pull/1529).
* Renamed layoutShift to the more correct cumulativeLayoutShift. This will is a breaking change if you use that metric. Updates to the new and coming layout shift changes announced by Google will be implemented the coming weeks.
* Updated Chrome start flags on desktop following [best practices](https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md) and removing old flags [#1507](https://github.com/sitespeedio/browsertime/pull/1507).
* Updated Chrome start flags on Android following [best practices](https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md) and removing old flags [#1506](https://github.com/sitespeedio/browsertime/pull/1506).
* Finally the "new" connectivity settings are default. You can see the difference in https://github.com/sitespeedio/browsertime/blob/main/lib/connectivity/trafficShapeParser.js#L5-L104. Changed in [#1540](https://github.com/sitespeedio/browsertime/pull/1540). If you wanna run with the legacy setting use `--legacyConnectivityProfiles`. See [#1160](https://github.com/sitespeedio/browsertime/pull/1160) for the original change.
* The default minimum wait time for waiting if a test is finished is now 8 seconds (instead of 5) [#1542](https://github.com/sitespeedio/browsertime/pull/1542).
### Fixed
* Fix `--chrome.blockDomainsExcept` when you are using WebPageReplay [#1532](https://github.com/sitespeedio/browsertime/pull/1532). Thank you [Inderpartap Singh Cheema](https://github.com/inderpartap) for the original fix!
* Make sure gnirehtet is closed on the right device using device id [#1527](https://github.com/sitespeedio/browsertime/pull/1527)
* Upgraded to Geckodriver 0.29.1.
* Updated wpr_cert.pem to a new version for WebPageReplay [#1316](https://github.com/sitespeedio/browsertime/pull/1316).
* Include Google Web Vitals in the HAR file [#1535](https://github.com/sitespeedio/browsertime/pull/1535).
* Added 3 seconds wait time for geckoprofiler to start see [#1538](https://github.com/sitespeedio/browsertime/issues/1538) and [#1539](https://github.com/sitespeedio/browsertime/pull/1539)
* Added a ten seconds wait if getting the HAR from Firefox fails the first time [#1546](https://github.com/sitespeedio/browsertime/pull/1546) fixes [#3346](https://github.com/sitespeedio/sitespeed.io/issues/3346).

### Added
* New metrics: Delta between TTFB and First Contentful Paint, Largest Contentful paint and First visual change [#1528](https://github.com/sitespeedio/browsertime/pull/1528). You can use this if you have unstable TTFB and want to alert on front end metrics. Lets see when other also implement this :)
* Made it easier for people to get Google Web Vitals. We copy that data under the googleWebVitals namespace in the result JSON [#1521](https://github.com/sitespeedio/browsertime/pull/1521).
* Added TTFB as a single metric [#1522](https://github.com/sitespeedio/browsertime/pull/1522).
* New stop watch command [#1512](https://github.com/sitespeedio/browsertime/pull/1512). Measure time by: 
  ```const timer = commands.stopWatch.get('my_timer'); 
     timer.start(); 
     // Do something
     // Stop the timer and add the result to the last tested URL
     timer.stopAndAdd();
  ```
* Pre test/warm a URL with `--preWarmServer`. Do that to make sure your server has cached everything that is needed before your test [#1515](https://github.com/sitespeedio/browsertime/pull/1515) and [#1516](https://github.com/sitespeedio/browsertime/pull/1516).
* Collect what HTML element change in cumulative layout shifts [#1534](https://github.com/sitespeedio/browsertime/pull/1534)
* Added support for recording video on Safari iOS [#1541](https://github.com/sitespeedio/browsertime/pull/1541).
* New commands: scrolling by Pixels, Lines or Pages forward, back or refresh navigations, create new tabs or windows and switch to them and new mouse events such as context click, single click, double click, click and hold, release, and movement. Thank you [Denis Palmeiro](https://github.com/dpalmeiro) for PR [#1533](https://github.com/sitespeedio/browsertime/pull/1533).
* Improve proxy configuration support, thank you [Olaf Meeuwissen](https://github.com/paddy-hack) for PR [#1542](https://github.com/sitespeedio/browsertime/pull/1524).
* Upgraded to Selenium 4.0.0-beta.3 [#1544](https://github.com/sitespeedio/browsertime/pull/1544).
* Updated to Chrome 90 in the Docker container and Chromedriver 90 as default [#1543](https://github.com/sitespeedio/browsertime/pull/1543).
## 11.6.3 - 2021-03-17

### Fixed
* Last release broke getting Chromes netlog on desktop, fixed in [#1511](https://github.com/sitespeedio/browsertime/pull/1511). Also added the ability to set the log level of the netlog.
## 11.6.2 - 2021-03-17

### Fixed
* Fixed getting the netlog from Chrome on Android [#1508](https://github.com/sitespeedio/browsertime/pull/1508).
* Combine the gecko perfstats from each process, thank you [Andrew Creskey](https://github.com/acreskeyMoz) for the PR [#1504](https://github.com/sitespeedio/browsertime/pull/1504).
* Upgraded to Selenium 4.0.0-beta.2 (from beta.1) [#1509](https://github.com/sitespeedio/browsertime/pull/1509).

## 11.6.1 - 2021-03-11
### Fixed
* Added Python2 to the Docker container for (Kubernetes)users that run TSProxy and made sure python2 is used for that proxy when you run in Docker [#1503](https://github.com/sitespeedio/browsertime/pull/1503).

## 11.6.0 - 2021-03-08
### Added
* Make it possible to set number of threads used for FFMPEG using `--videoParams.threads`. Thank you [Leo Blöcher](https://github.com/TheJokr) for PR [#1493](https://github.com/sitespeedio/browsertime/pull/1493).
* Updated to Chrome 89 and Firefox 86 in the Docker container and updated to Chromedriver 89 [#1499](https://github.com/sitespeedio/browsertime/pull/1499).
* Get internal Firefox performance statistics by `--firefox.perfStats`. Thank you [dpalmeiro](https://github.com/dpalmeiro) for PR [#1495](https://github.com/sitespeedio/browsertime/pull/1495).
* Updated to Edgedriver 89 [#1500](https://github.com/sitespeedio/browsertime/pull/1500).

### Fixed
* Better error log if we miss out on stats when adding fully loaded [#1496](https://github.com/sitespeedio/browsertime/pull/1496).

## 11.5.0 - 2021-02-16
### Added
* Make it easy to run [gnirehtet](https://github.com/Genymobile/gnirehtet) when you run your tests on your Android phone to reverese tethering the traffics. Start gnirehtet with ```--gnirehtet``` (gnirehtet needs to be in your PATH). Fixed in [#1489](https://github.com/sitespeedio/browsertime/pull/1489) and [#1490](https://github.com/sitespeedio/browsertime/pull/1490).
* Updated to Selenium 4.0.0-beta.1 [#1491](https://github.com/sitespeedio/browsertime/pull/1491).
### Fixed
* Follow the same pattern as sitespeed.io when replacing characters in file names [#1488](https://github.com/sitespeedio/browsertime/pull/1488).

## 11.4.0 - 2021-02-02
### Added
* Added failure state in the result JSON. You get a new command: `markAsFailure(message)` where you can mark a test as a failure. If one run fails, all tests are marked as failed. The JSON from Browsertime (that is used in sitespeed.io) gets a failure status  and an array of failure messages (potentially you can mark a run as failed multiple times). If we get an uncaught error from running the browser we also mark the test as failed [#1482](https://github.com/sitespeedio/browsertime/pull/1482).s

### Fixed
* Updated dependencies to  latest versions:  jimp, yargs, find-up, dayjs and chrome-remote-interface [#1485](https://github.com/sitespeedio/browsertime/pull/1485).
## 11.3.1 - 2021-02-02
### Fixed
* Fix so we start/close the iOS simulator before the first test and close it after the last one [#1484](https://github.com/sitespeedio/browsertime/pull/1484).
## 11.3.0 - 2021-01-30
### Added
* Add better support for using the iOS simulator [#1475](https://github.com/sitespeedio/browsertime/pull/1475) and [#1480](https://github.com/sitespeedio/browsertime/pull/1480).
* Record a video when using the iOS simulator [#1476](https://github.com/sitespeedio/browsertime/pull/1476) and [#1481](https://github.com/sitespeedio/browsertime/pull/1481).
* Use throttle as default engine when you use the iOS simulator [#1479](https://github.com/sitespeedio/browsertime/pull/1479).

## 11.2.0 - 2021-01-24
### Added
* Make it possible to listen to CDP events in scripting [#1473](https://github.com/sitespeedio/browsertime/pull/1473). There's a new command in scripting (for browsers that supports it): ```commands.cdp.on```. Here's an example to pickup all responses for a page : 
``` 
    const responses = [];
    await commands.cdp.on('Network.responseReceived', params => {
     responses.push(params);
    });
    await commands.measure.start('https://www.sitespeed.io/search/');
    // Here you can check the array with all responses received
```
## 11.1.2 - 2021-01-20
### Fixed
* The last release didn't fix the problem when browsertime do not collect metrics. 
## 11.1.1 - 2021-01-20
### Fixed
* Added a guard if we do not collect any metrics [#1472](https://github.com/sitespeedio/browsertime/pull/1472).
## 11.1.0 - 2021-01-20
### Added
* Upgraded to Chromedriver 88 and Chrome 88 in the Docker container.
## 11.0.2 - 2021-01-19
### Fixed
* Make it configurable to press the power button when you start the tests with `--androidPretestPowerPress`[#1462](https://github.com/sitespeedio/browsertime/pull/1462). Thank you [Gregory Mierzwinski](https://github.com/gmierz) for the PR.

* Catch if a URL change between runs. If you use a script, set an alias to a URL and then the next run the URL changed, that caused an error and Browsertime failed [#1467](https://github.com/sitespeedio/browsertime/pull/1467). The alias for a URL wasn't propagated the right way, fixed in [#1468](https://github.com/sitespeedio/browsertime/pull/1468).

* This patch is for storing the gecko profile paths in the browsertime results. This makes it easier to figure out which gecko profiles go with which tests. [#1466](https://github.com/sitespeedio/browsertime/pull/1466). Thank you [Gregory Mierzwinski](https://github.com/gmierz) for the PR!
## 11.0.1 - 2021-01-05
### Fixed
* Setting path to Edge was broken, use `--edge.binaryPath` to point out the path to your Edge binary [#1461](https://github.com/sitespeedio/browsertime/pull/1461).
## 11.0.0 - 2020-12-18
### Changed
* Record and keep the browser full screen (including URL bar) [#1435](https://github.com/sitespeedio/browsertime/pull/1435). All metrics should stay the same with this change but the video and the code will be easier :) When we implemented video a long time ago we wanted to cut out the URL bar but it made it harder to keep the video to look ok on different OS. 
* Say goodbye to RUM Speed Index [#1439](https://github.com/sitespeedio/browsertime/pull/1439).
* Domain name on disk now uses underscore instead of dots in the name [#1445](https://github.com/sitespeedio/browsertime/pull/1445).
* Click the Android power button at the start of each test (instead of the home button [#1447](https://github.com/sitespeedio/browsertime/pull/1447).

### Fixed
* Added a two minute timeout to get Geckoprofiler data [#1440](https://github.com/sitespeedio/browsertime/pull/1440).
* Made sure HAR stuff respect the skipHar flag [#1438](https://github.com/sitespeedio/browsertime/pull/1438)
* Fix process ID fetch for Galaxy S5, thank you [Michael Comella](https://github.com/mcomella) for PR [#1449](https://github.com/sitespeedio/browsertime/pull/1449)
* If a web page timed out in Chrome, we missed to report that as an error, fixed in [#1453](https://github.com/sitespeedio/browsertime/pull/1453).

### Added
* Automatically close "System not responding"-popup on Android if it exists [#1444](https://github.com/sitespeedio/browsertime/pull/1444).
* Add support using alias from CLI and use alias as folder name on disk [#1443](https://github.com/sitespeedio/browsertime/pull/1443).
* New option to store a more flat structure on disk converting the path part of the URL to one folder `--storeURLsAsFlatPageOnDisk`[#1450](https://github.com/sitespeedio/browsertime/pull/1450)
* Updated to Selenium 4.0.0-alpha.8 [#1451](https://github.com/sitespeedio/browsertime/pull/1451).
* Updated to Firefox 84 in the Docker container. 
* Updated to Edgedriver 87
* Added Edge in the Docker container [#1458](https://github.com/sitespeedio/browsertime/pull/1458).

## 10.9.0 - 2020-11-18
### Added
* It's now easier to run Firefox Nightly/Beta on your Android phone. Use `--firefox.nightly` / `--firefox.beta` [#1432](https://github.com/sitespeedio/browsertime/pull/1432).
* Make it possible to add [flags](https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html) to Geckodriver using `--firefox.geckodriverArgs` [#1433](https://github.com/sitespeedio/browsertime/pull/1433).

### Fixed
* The browsertime.json always included Firefox appConstants and the geckoprofiler JSON missed out on Visual Metrics, fixed in [#1434](https://github.com/sitespeedio/browsertime/pull/1434).
## 10.8.0 - 2020-11-18
### Added 
* Updated to Firefox 83 in the Docker container.
* Updated Chrome and Chromedriver to 87.
##  10.7.0 - 2020-11-16
### Added
* Add page generator tag to the HAR file [#1430](https://github.com/sitespeedio/browsertime/pull/1430) 

### Fixed
* Reverted to Geckodrover 0.27.0 since 0.28.0 cannot start Firefox on Android [#1431](https://github.com/sitespeedio/browsertime/pull/1431).
##  10.6.5 - 2020-11-11
### Fixed
* Upgraded to Geckodriver 0.28.0.
* Set firefox environment variables in process.env, PR by [Kanishk](https://github.com/kanishk509)  thank you [#1426](https://github.com/sitespeedio/browsertime/pull/1426).

##  10.6.4 - 2020-10-28
### Fixed
* Add the missing mobile phone id to the HAR file (with the other Android setup data) [#1424](https://github.com/sitespeedio/browsertime/pull/1424).
* Remove Firefox preferences that disables the speculative connection pool, thank you [Andrew Creskey](https://github.com/acreskeyMoz) for the PR [#1423](https://github.com/sitespeedio/browsertime/pull/1423).

## 10.6.3 - 2020-10-26
### Fixed
* Fix navigating to the same URL twice in the same script (that was broken in 10.0) [#1421](https://github.com/sitespeedio/browsertime/pull/1421).
* Make sure we log the Android phone id when the internet connection/USB connection fails on the phone [#1420](https://github.com/sitespeedio/browsertime/pull/1420).

## 10.6.2 - 2020-10-23
### Fixed
* If the browser failed to navigate, the error caused the result.json to not be generated [#1417](https://github.com/sitespeedio/browsertime/pull/1417).

## 10.6.1 - 2020-10-21
### Fixed
* If the browser hangs and cannot be closed, make sure we timeout after 2 minutes of trying [#1415](https://github.com/sitespeedio/browsertime/pull/1415).
* Removed special hack for bug https://bugzilla.mozilla.org/show_bug.cgi?id=1298921 that was fixed long time ago [#1415](https://github.com/sitespeedio/browsertime/pull/1414).

## 10.6.0 - 2020-10-20
### Added
* Firefox 82 in the Docker container.

### Fixed
* Better log messages when the browser do not start start [#1411](https://github.com/sitespeedio/browsertime/pull/1411).

## 10.5.0 - 2020-10-15
### Added
* Updated to Edgedriver 86.
* Reboot your Android phone if the battery temperature don't meet your limit after X tries. Enable with `--androidBatteryTemperatureReboot` [#1409](https://github.com/sitespeedio/browsertime/pull/1409).

## 10.4.1 - 2020-10-13
### Fixed
* Fix so that `-vvv` enables trace log level for Marionette when you use Firefox [#1405](https://github.com/sitespeedio/browsertime/pull/1405).

## 10.4.0 - 2020-10-07
### Added
* Upgraded to Chromedriver 86 and Chrome 86 in the Docker container.

## 10.3.0 - 2020-10-03
### Added
* Add option to navigate with WebDriver instead of window.location with `--webdriverPageload`. Thank you [Andrew Creskey](https://github.com/acreskeyMoz) for the PR [#1396](https://github.com/sitespeedio/browsertime/pull/1396).
* Add option for specifying logging format in visualmetrics.py. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for the PR throttl[#1399](https://github.com/sitespeedio/browsertime/pull/1399).

### Fixed
* Fix bufferSize to proper 100MB default size for Geckoprofiler, thank you [dpalmeiro](https://github.com/dpalmeiro) for the PR [#1394](https://github.com/sitespeedio/browsertime/pull/1394).

* Max number of tries to check battery temperature on Android to make sure a test doesn't wait forever to run [#1401](https://github.com/sitespeedio/browsertime/pull/1401).

## 10.2.1 - 2020-09-25
### Fixed
* Create the data dir for a URL direct after page complet fired so that collecting the MOZ log work [#1388](https://github.com/sitespeedio/browsertime/pull/1388).

## 10.2.0 - 2020-09-23
### Added
* The Docker container now uses Firefox 81.

## 10.1.0 - 2020-09-22

### Added
* Extra love for running tests in Android: Press the home button at the start of a test, verify that the phone state is "device" before starting to test (no need to run tests on offline devices) and 
added possibility to verify the internet connection on the device through ping (enable with `--androidVerifyNetwork`) [#1386](https://github.com/sitespeedio/browsertime/pull/1386).

### Fixed
* Reverted using buffered flag for Chrome Long Tasks (we missed Long Tasks with the new setup) [#1383](https://github.com/sitespeedio/browsertime/pull/1383).

## 10.0.0 - 2020-09-20

The new 10.0 release mostly include technical changes that will make it easier for us in the future to make changes and keep Browsertime the number one performance engine :) However if yoy use Contentful and Perceptual Speed Index there are one breaking change.

## Breaking changes
* If you collect visual metrics, we do not calculate Contentful Speed Index and Perceptual Speed Index by default any more. Turn them on by using `--visualMetricsPerceptual` and `--visualMetricsContentful`. This will make your testing faster by default [#1358](https://github.com/sitespeedio/browsertime/pull/1358).

## Changed
* Get CPU long tasks by default using Chrome: A couple of releases ago, Chrome started to support buffered long tasks, that means we don't need to inject any JS to make sure we catch all long tasks. The code is simpler and since (hopefully) the new buffered version doesn't give any performance penelty, we can start getting longtasks by default. [#1341](https://github.com/sitespeedio/browsertime/pull/1341).

* Stop recording the video direct after the PageCompleteCheck fired. This make the original video smaller, saves time converting the video to a vieable format and makes Visual Metrics a little faster [#1357](https://github.com/sitespeedio/browsertime/pull/1357).

* Use fast preset (instead of medium) when converting the video to a format that works in all video players [#1359](https://github.com/sitespeedio/browsertime/pull/1359).

* If you use scripting and use the ...AndWait methods, we now increased the extra wait time before we run the page complete check from 1000ms to 2000ms. With the other changes we done, this was needed for Firefox since it sometimes didn't have time to navigate before the complete check run [#1375](https://github.com/sitespeedio/browsertime/pull/1375).

* Make sure the screen is turned on independently of electric source (before it was only USB) on Android [#1378](https://github.com/sitespeedio/browsertime/pull/1378)

### Tech
* Making a better structure for each browser, so its more understandable when you can run browser specific code. The old browser delegate (now only browser name) has the newly named functions:
* beforeBrowserStart
* afterBrowserStart 
* beforeStartIteration
* beforeEachURL
* afterPageCompleteCheck
* afterEachURL
* failing
* getHARs
* beforeBrowserStop

This makes it easier to make sure when to collect metrics, stop trace logs and do whatever you need. Implemented in [#1348](https://github.com/sitespeedio/browsertime/pull/1348) and [#1367](https://github.com/sitespeedio/browsertime/pull/1367). 

* New structure for browser, trying to decrease line of code per file and making it easier to navigate the code and prepare for adding support for other browser drivers than Selenium [#1354](https://github.com/sitespeedio/browsertime/pull/1354) [#1355](https://github.com/sitespeedio/browsertime/pull/1355) [#1356](https://github.com/sitespeedio/browsertime/pull/1356).

#1383* Moved page complete scripts to a new folder to make it clean [#1361](https://github.com/sitespeedio/browsertime/pull/1361).

* Restructure the video code [#1364](https://github.com/sitespeedio/browsertime/pull/1364).

## Added
* By default the video is converted to a format that works in most video players. You can skip that convertion (to save time) by using `--videoParams.convert false`. Visual Metrics will still work, but the video may not work in your player [#1360](https://github.com/sitespeedio/browsertime/pull/1360).

* Make sure the video file is removed from the Android phone when its been copied to desktop [#1377](https://github.com/sitespeedio/browsertime/pull/1377).

* Making it easy to run Firefox on Android [#1379](https://github.com/sitespeedio/browsertime/pull/1379).

* Fix how MOZ_LOG collection works and allow custom MOZ_LOG settings [#1382](https://github.com/sitespeedio/browsertime/pull/1382). Thank you [Gregory Mierzwinski](https://github.com/gmierz).

## Fixed
* Fixed broken CPU throttling in Chrome [#1381](https://github.com/sitespeedio/browsertime/pull/1381).

## 9.4.2 - 2020-08-29
### Fixed
* Make sure First Paint is collected when First Contentful Paint exists in Firefox. Thank you [Sean Feng](https://github.com/sefeng211) for the PR [#1347](https://github.com/sitespeedio/browsertime/pull/1347).

## 9.4.1 - 2020-08-28
### Fixed
* Fix broken Android shell command. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR  [#1345](https://github.com/sitespeedio/browsertime/pull/1345).
* Check if pathname exists before splitting. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for PR [#1343](https://github.com/sitespeedio/browsertime/pull/1343).

## 9.4.0 - 2020-08-26
### Added
* [Added Chromedriver 85](https://github.com/sitespeedio/browsertime/pull/1342).
* Updated to Chrome 85 and Firefox 80 in the Docker container.

## 9.3.1 - 2020-08-24
### Fixed
* Use the correct settings to set the emulation for Chrome [#1340](https://github.com/sitespeedio/browsertime/pull/1340).
* Bump versions: dayjs, execs, speedline-core, yargs. jimp [#1339](https://github.com/sitespeedio/browsertime/pull/1339).
* Updated to Throttle 2.0.1 [#1338](https://github.com/sitespeedio/browsertime/pull/1338).

## 9.3.0 - 2020-08-17
### Added
* Updated to Geckodriver 0.27.0 [#1330](https://github.com/sitespeedio/browsertime/pull/1330).

### Fixed
* Updated Chrome-HAR to 0.11.11.
* Fix to include visual metrics in the HAR, thank you [Mason Malone](https://github.com/MasonM) for the PR [#1335](https://github.com/sitespeedio/browsertime/pull/1335).

##  9.2.1 - 2020-07-31
### Fixed
* New chrome-har and updated day-js dependency.
* Ignore a couple of more pixels at the bottom of the browser screen to ignore Chromiums loading info bar, thank you [Pan Alexey](https://github.com/pan-alexey) for the PR [#1327](https://github.com/sitespeedio/browsertime/pull/1327).

## 9.2.0 - 2020-07-28
### Added
* Updated to Firefox 79 in the Docker container.

## 9.1.0 - 2020-07-17
### Added
* Updated to Chromedriver and Edgedriver 84, Chrome 84 and Firefox 78 in the Docker container [1323](https://github.com/sitespeedio/browsertime/pull/1323).

## 9.0.2 - 2020-07-08
### Fixed
* Guard against missing FF options when running without CLI [#1319](https://github.com/sitespeedio/browsertime/pull/1319).
* Safer check for layoutShift [#1318](https://github.com/sitespeedio/browsertime/pull/1318).

## 9.0.1 - 2020-07-07
### Fixed
* Fix support for running setup & teardown in a script. This was working fine from the CLI but not running it programmatically as reported in [sitespeed.io #3068](https://github.com/sitespeedio/sitespeed.io/issues/3068). [#1317](https://github.com/sitespeedio/browsertime/pull/1317).

## 9.0.0 - 2020-06-26
### Changed
* Change how screenshot are stored to support multiple screenshots for one run. Screenshots per run is an array, store screenshots per folder per run *screenshoots/1/* and name the default screenshot to afterPageCompleteCheck[#1312](https://github.com/sitespeedio/browsertime/pull/1312).

### Fixed
* Updated to latest throttle, jimp, day-js.

### Added
* Add support to run privileged JavaScript in scripts and wait for page to load [#1314](https://github.com/sitespeedio/browsertime/pull/1314).

## 8.14.0 - 2020-06-03
### Added
* Option to configure number of browser restart tries [#1292](https://github.com/sitespeedio/browsertime/pull/1292). Use `--browserRestartTries`.
* Use Firefox 77 in the Docker container.
* Add support for Android power testing [#1296](https://github.com/sitespeedio/browsertime/pull/1296). Thank you [Gregory Mierzwinski](https://github.com/gmierz) for the PR! Also [#1300](https://github.com/sitespeedio/browsertime/pull/1300) adds supports for power testing on Chrome.

### Fixed
* Running wiothout the CLI caused error logs removing Firefox appconstants [#1294](https://github.com/sitespeedio/browsertime/pull/1294).
* Fixed broken MS Edge support (since 80?) and upgraded to Edgedriver 83 [#1298](https://github.com/sitespeedio/browsertime/pull/1298)

## 8.13.1 - 2020-05-26
### Fixed
* The log was putting CLS in % even though it isn't [#1288](https://github.com/sitespeedio/browsertime/pull/1288).
* Updated dependencies: chrome-har, execa, chrome-remote-interface and dayjs [#1290](https://github.com/sitespeedio/browsertime/pull/1290) and [#1289](https://github.com/sitespeedio/browsertime/pull/1289)

## 8.13.0 - 2020-05-19
### Added
* Upgraded to Chromedriver 83 Upgraded to Chrome 83 in the Docker container.
* Include FCP and LCP in the timings in the HAR file [#1285](https://github.com/sitespeedio/browsertime/pull/1285).
### Fixed
* Fixed decimal formating in statistics [#1286](https://github.com/sitespeedio/browsertime/pull/1286)

## 8.12.1 - 2020-05-19
### Fixed
* Fixed so metrics in the CLI always shows two decimals [#1282](https://github.com/sitespeedio/browsertime/pull/1282). 
* Adopt the rename of layout-instability-api to CLS and remove report in percentage since it do not make sense [#1283](https://github.com/sitespeedio/browsertime/pull/1283) and [#1284](https://github.com/sitespeedio/browsertime/pull/1284).

## 8.12.0 - 2020-05-12
### Added
* Run tests with Safari Technology Preview using `--safari.useTechnologyPreview` [#1280](https://github.com/sitespeedio/browsertime/pull/1280).

## 8.11.1 - 2020-05-09
### Fixed
* Metrics output was broken in 8.11.0 if you only do one run [#1278](https://github.com/sitespeedio/browsertime/pull/1278).

## 8.11.0 - 2020-05-09
### Added
* Output TBT, CLS and TTFB in the CLI summary when availible [#1276](https://github.com/sitespeedio/browsertime/pull/1276) and per run. Also unify how we output metrics from thee CLI [#1277](https://github.com/sitespeedio/browsertime/pull/1277).
* New build of WebPageReplay in the Docker container [#1271](https://github.com/sitespeedio/browsertime/pull/1271).
* Make it possible to enable Safe Browsing and Tracking protection for Firefox. Fireefox precerences was messed up before. Set `--firefox.disableSafeBrowsing false --firefox.disableTrackingProtection false` and let the browser settle for 30 seconds to download the lists and they are enabled. In the future we want it to be enabled by default [#1272](https://github.com/sitespeedio/browsertime/pull/1272).

##  8.10.0 - 2020-05-07
### Added
* Upgraded to Firefox 76 in the Docker container.

## 8.9.1 - 2020-05-05
### Fixed
* Reverted to Python 2 in the Docker container to make TSProxy work again.
* Kernel fix when running on rooted Android devices [#1267](https://github.com/sitespeedio/browsertime/pull/1267).
* Smaller font for Visual Metrics in the video to fit on Android devices [#1268](https://github.com/sitespeedio/browsertime/pull/1268) and [#1269](https://github.com/sitespeedio/browsertime/pull/1269)
* Fixed so Visual Metrics and the timer us a Mono space font in Docker to avoid flicker [#1270](https://github.com/sitespeedio/browsertime/pull/1270).

## 8.9.0 - 2020-04-30
### Added
* Collect Android model data and include it in the result.json and log it [#1263](https://github.com/sitespeedio/browsertime/pull/1263).

### Fixed
* Still issues with removing Firefox appConstant data. It seems like sometimes we don't get the browser info at all. Let us be even more safe when we try to remove it [#1265](https://github.com/sitespeedio/browsertime/pull/1265).

## 8.8.0 - 2020-04-29
### Added
* Extra love running on rooted Android devices: I've moved over Mozillas [best practices getting stable metrics](https://dxr.mozilla.org/mozilla-central/source/testing/raptor/raptor/performance_tuning.py) on Android. There are some extra love there for Moto G5 and Pixel 2. Turn on with `--androidRooted`, see [#1255](https://github.com/sitespeedio/browsertime/pull/1255). Be careful though: We will setup everything for performance and the phone will keep that state even after the tests.

* Always keep Android phones awake when running on USB [#1257](https://github.com/sitespeedio/browsertime/pull/1257).

### Fixed
* Verify that FF data (appConstant etc) exist before trying to delete it. The bug [#1261](https://github.com/sitespeedio/browsertime/issues/1261) was introduced in 8.7.0 and fixed in PR [#1262](https://github.com/sitespeedio/browsertime/pull/1262).

## 8.7.1 - 2020-04-28
### Fixed
* Fix nan check for Firefox preferences as reported in [#1254](https://github.com/sitespeedio/browsertime/issues/1254) and fixed by [#1256](https://github.com/sitespeedio/browsertime/pull/1256).

## 8.7.0 - 2020-04-24
### Fixed
* Fixed typo in an error message of click.js, fixed in [#1246](https://github.com/sitespeedio/browsertime/pull/1246), thank you [petemyron](https://github.com/petemyron).
* Mouse focus on element won't be lost at script measurement start, fixed in [#1248](https://github.com/sitespeedio/browsertime/pull/1248). Thank you [Icecold777](https://github.com/Icecold777).
* With the great merge of Mozillas changes I've missed to make sure the result.json wasn't bloated. [Gregory Mierzwinski](https://github.com/gmierz) fixed this in [#1252](https://github.com/sitespeedio/browsertime/pull/1252) making sure a lot of Firefox internal data isn't included by default. You can still enable that with `--firefox.appconstants`.

### Added
* New command `wait.bySelector(selector, maxTime)` implemented in [#1247](https://github.com/sitespeedio/browsertime/pull/1247).
* Adding screenshots in scripting is a great feature and one thing that was missing was that the result JSON do not include any references to the screenshots, so tools that uses browsertime, didn't know that they exist. In sitespeed.ios case the screenshots are stored to disk but now shown. [#1245](https://github.com/sitespeedio/browsertime/pull/1245).
* Automatically collect battery temperature for your Andorid phone. Collect start temperature (before you start to test your page) and stop temperature (when your test stopped) [#1250](https://github.com/sitespeedio/browsertime/pull/1250).
* Use `--androidBatteryTemperatureLimit` to set a minimum battery temperature limit before you start your test on your Android phone. Temperature is in [Celsius](https://en.wikipedia.org/wiki/Celsius). [#1253](https://github.com/sitespeedio/browsertime/pull/1253).

## 8.6.1 - 2020-04-16
### Fixed
* Crawling on Android in sitespeed.io failed because the wrong port for CDP was used, fixed in [#1240](https://github.com/sitespeedio/browsertime/pull/1240).
* Catch and log if CDP isn't setup correctly [#1241](https://github.com/sitespeedio/browsertime/pull/1241).
* When we run on Android for Chrome we leaked one adb forward for devtools per test. It wasn't from Browsertime directly so either from Selenium/Chromedriver. Now we close them all for that device that runs the test [#1243](https://github.com/sitespeedio/browsertime/pull/1243).

## 8.6.0 - 2020-04-15
### Added
* Updated the Docker container to use Ubuntu 20.04
* Updated the Docker container to use Python 3
* Updated Visual Metrics to support Python 3

All work in [#1234](https://github.com/sitespeedio/browsertime/pull/1234) and [#1235](https://github.com/sitespeedio/browsertime/pull/1235).

* Show FCP and LCP in the console after a succesful run (and removed RUM Speed Index) [#1237](https://github.com/sitespeedio/browsertime/pull/1237) and [#1238](https://github.com/sitespeedio/browsertime/pull/1238).

## 8.5.0 - 2020-04-08
### Added
* Updated to Chromedriver 81. Updated to Chrome 81 and Firefox 75 in the Docker container.

## 8.4.0 - 2020-04-03
### Added
* Add support for IQR filtering of metrics `--iqr` [#1229](https://github.com/sitespeedio/browsertime/pull/1229).

### Fixed
* Emptying the cache and other commands that uses the extension server for Firefox was broken when running scripting. Fixed in [#1230](https://github.com/sitespeedio/browsertime/pull/1230).

## 8.3.1 - 2020-03-26
### Fixed
* Back fill render time for LCP render time from load time [#1225](https://github.com/sitespeedio/browsertime/pull/1225).
* [Skip including](https://github.com/sitespeedio/browsertime/commit/68607e8e9d2ef3b697b2a995a2f9bda50fd68976) videoRecordingStart in the HAR timings.
* [Added CLI docs](https://github.com/sitespeedio/browsertime/commit/8ee3f1a811a5f3ee8db212b2bc971c8b611706a7) for example Chrome trace category.

## 8.3.0 - 2020-03-20
### Added
* Upgraded from selenium-4.0.0-alpha.5 to selenium-4.0.0-alpha.7 [#1221](https://github.com/sitespeedio/browsertime/pull/1221).
* Added supported for unified scripts Thank you [Tarek Ziade](https://github.com/tarekziade) for the PR [#1220](https://github.com/sitespeedio/browsertime/pull/1220). Checkout [#1216](https://github.com/sitespeedio/browsertime/issues/1216) for more info. 

### Fixed
* Running Chrome in emulated mobile mode sometimes picked up Chromes info bar as First Visual Change. The default bottom margin was changed from 10 pixels to 16 pixels [#1224](https://github.com/sitespeedio/browsertime/pull/1224).

## 8.2.0 - 2020-03-11
### Added
* Upgraded to Firefox 74 in the Docker container
* Removed the Sharp dependency and instead added jimp [#1128](https://github.com/sitespeedio/browsertime/pull/1218). This makes the package smaller and easier to install (only JS dependencies).
* Cleaned up dependencies to not use shrinkwrap to minimize size see https://github.com/sitespeedio/sitespeed.io/issues/2911#issuecomment-596538673

## 8.1.2 - 2020-03-09
### Fixed
* Removed the npm shrinkwrap file, updated dependencies that do not use one and introduced a package-lock file. Why? See https://github.com/sitespeedio/sitespeed.io/issues/2911#issuecomment-596538673.

## 8.1.1 - 2020-03-08
### Fixed
* Remove Visual Metrics vis-color color temp dir [#1210](https://github.com/sitespeedio/browsertime/pull/1210), thank you [dpalmeiro](https://github.com/dpalmeiro) for the PR.
* Verify that you use at least NodeJS 10 when trying to run Browsertime [#1212](https://github.com/sitespeedio/browsertime/pull/1212).

## 8.1.0 - 2020-02-20
### Fixed
* Updated dependencies sharp, yargs, dayjs, get-port [#1171](https://github.com/sitespeedio/browsertime/pull/1171).
* Removed the del dependency [#1172](https://github.com/sitespeedio/browsertime/pull/1172)
* Removed the mkdirp dependency [#1173](https://github.com/sitespeedio/browsertime/pull/1173)
* Removed the lodash.remove dependency [#1174](https://github.com/sitespeedio/browsertime/pull/1174)
* Removed the lodash.forEach dependency [#1175](https://github.com/sitespeedio/browsertime/pull/1175)
* Fixed bug for `--firefox.profileTemplate`, thank you [Gregory Mierzwinski](https://github.com/gmierz) - [#1185](https://github.com/sitespeedio/browsertime/pull/1185).
* If the browser failed to start, the exit code from Browsertime was 0 and the error wasn't included in the result JSON. Fixed in [#1188](https://github.com/sitespeedio/browsertime/pull/1188).

### Added
* Get total number of resources and total duration time (using the Resource Timing API). The metrics exists in *pageinfo.resources.duration* and *pageinfo.resources.count*. Thank you [Sean Feng](https://github.com/sefeng211) for PR [#1167](https://github.com/sitespeedio/browsertime/pull/1167) and [#1176](https://github.com/sitespeedio/browsertime/pull/1176).
* Make it possible to record video using FFMPEG on OS X [#1180](https://github.com/sitespeedio/browsertime/pull/1180),[#1184](https://github.com/sitespeedio/browsertime/pull/1184) and [#1190](https://github.com/sitespeedio/browsertime/pull/1190)
* Upgraded to Firefox 73 in the Docker container.
* Save TCPdump per package instead of using the buffer. Turn on with `--tcpdumpPacketBuffered` together with `--tcpdump` [#1198](https://github.com/sitespeedio/browsertime/pull/1198).
* Include Edgedriver by default (for OS that are supported) [#1199](https://github.com/sitespeedio/browsertime/pull/1199).
* Updated driver wrappers so you always can choose which version to install [#1200](https://github.com/sitespeedio/browsertime/pull/1200).

### Tech
* Run Travis-CI tests on both Linux, OS X and Windows [#1183](https://github.com/sitespeedio/browsertime/pull/1183) and [#1187](https://github.com/sitespeedio/browsertime/pull/1187).

## 8.0.1 2020-02-07

### Fixed
* Fixed broken TSProxy, thank you [Kenrick](https://github.com/kenrick95) for the PR [#1169](https://github.com/sitespeedio/browsertime/pull/1169).
* Keep the orange frame length to make it easier to debug if soemthing is wrong, thank you [Sean Feng](https://github.com/sefeng211) for PR [#1165](https://github.com/sitespeedio/browsertime/pull/1165).
* Fix for "Visual metrics are not correct when running browsertime with the new Firefox for Android browser (Fenix) when WebRender is enabled, because there's a bug in WebRender. Thank you [Sean Feng](https://github.com/sefeng211) for PR [#1166](https://github.com/sitespeedio/browsertime/pull/1166).

## 8.0.0 2020-02-05

Woho Browsertime 8.0.0 is here!

There's a lot of new things in 8.0.0. First: A big THANK YOU to all the people at Mozilla that have contributed with all the new stuff: 
* [Nick Alexander](https://github.com/ncalexan)
* [Denis Palmeiro](https://github.com/dpalmeiro)
* [Sean Feng](https://github.com/sefeng211)
* [Chris Liu](https://github.com/cliu55)
* [Will Hawkins](https://github.com/hawkinsw)
* [Barret Rennie](https://github.com/brennie)
* [Tarek Ziade](https://github.com/tarekziade)
* [Gregory Mierzwinski](https://github.com/gmierz)

Major new things: 
* You can collect CPU profiles from Firefox with `--firefox.geckoProfiler` and view them at https://profiler.firefox.com !
* You can run Firefox on Android!
* Now the window recorder for Firefox works great. That means you can record a video of the loading of your page without using FFMPEG. Add `--firefox.windowRecorder` and `-video`to your run.
* You can use the new Chrom5ium based MS Edge on OS that support that browser.
* There has been a lot of work minimizing the impact of the browser to make it easier to get as stable metrics as possible.
* Use `--tcpdump` to get a tcpdump on desktop.

Lets go through all the new things. There's a couple things that changes:

### Changed
* Firefox uses preferences from the Mozilla performance team by default, to get as stable metrics as possible. This removes `--mozillaProPreferences` since those configurations are used by default [#1045](https://github.com/sitespeedio/browsertime/pull/1045).
* The default page complete check now uses performance.now instead of Date to make default behavior work for pages/proxies that overrides Date [#1044](https://github.com/sitespeedio/browsertime/pull/1044).
* New data structure for VisualProgress of Visual Metrics. It's now an array with objects `{timestamp:x, percent:y}`.
* Use pageLoadStrategy *none* as default [#1151](https://github.com/sitespeedio/browsertime/pull/1151).
* Rename latency to rtt/add 4g/add new profiles: Rename latency to rtt (this has been wrongly named for so long time), add 4g, changed 2g to become usable (follow WPT settings) and use the coming connectivity profiles with `--newConnectivityProfiles` (following the exact config as Throttle and WebPageTest) [#1160](https://github.com/sitespeedio/browsertime/pull/1160)

### Added
* New functionallity from the Mozilla perfromance team. Merge [#1028](https://github.com/sitespeedio/browsertime/pull/1028) - let us add each feature one by one when they are tested and working:
    * You can now collect a CPU profile using `--firefox.geckoProfiler`. You can also use: `--firefox.geckoProfilerParams.features`, `--firefox.geckoProfilerParams.threads`, `--firefox.geckoProfilerParams.interval` and `--firefox.geckoProfilerParams.bufferSize`to finetune what to get.
    * Collect metrics using Firefox on Android! Enable using `-b firefox --android` and tune using: `--firefox.android.package`, `--firefox.android.activity`, `--firefox.android.deviceSerial` and `--firefox.android.intentArgument`.
    * Start Firefox with a new profile cloned from a directory. Use this to pre-populate databases with
    certificateY, tracking protectionlists etc  `--firefox.profileTemplate`.
    * Fixes so `--firefox.windowRecorder` works better (use it to record a video of the screen).
    * You can now choose the Activity hosting the Chrome WebView on Android using `--chrome.android.activity`. You can also name the process of the Activity hosting the WebView using `--chrome.android.process`.  
* Move visualmetrics.py to a python package [#1148](https://github.com/sitespeedio/browsertime/pull/1148) - thank you [Tarek Ziade](https://github.com/tarekziade)!
* Run Safari on iOS with just `-b safari --ios` [#1141](https://github.com/sitespeedio/browsertime/pull/1141)
* Enable verbose Chromedriver logging with `--chrome.enableVerboseChromeDriverLog` [#1152](https://github.com/sitespeedio/browsertime/pull/1152)
* Enable Chromedriver log with `--chrome.enableChromeDriverLog` and gzip the log per iteration [#1133](https://github.com/sitespeedio/browsertime/pull/1133).
* Support for running Edge for OS that supports it. Use `-b edge` and `--edge.edgedriverPath` with the path to the matching MSEdgeDriver. Edge use the same setup as Chrome, so you `--chrome.*` to configure Edge :) [#1140](https://github.com/sitespeedio/browsertime/pull/1140).
* Added `--firefox.args` and `--firefox.env` [1110](https://github.com/sitespeedio/browsertime/pull/1110), thank you [Nick Alexander](https://github.com/ncalexan)!
* Always log configured features and threads when using geckoProfiler [#1092](https://github.com/sitespeedio/browsertime/pull/1092)
* Enable verbose logging when "using geckodriver [#1083](https://github.com/sitespeedio/browsertime/pull/1083) by [Nick Alexander](https://github.com/ncalexan).
* Pickup the Visual Metrics log file and if there's an error running Visual Metrics, log the information to our log. This will make easier and faster to find problems while running Visual Metrics and make it easier for users to report problems we can act on [#1085](https://github.com/sitespeedio/browsertime/pull/1085).
* Increase wait time before next try when navigation fails. First 10s, then 20s then 30s [#1086](https://github.com/sitespeedio/browsertime/pull/1086)
* Making Sharp an optional requirement as proposed by [Nick Alexander](https://github.com/ncalexan). If you don't install Sharp, screenshots will be stored as PNG as the current viewport size [#1084](https://github.com/sitespeedio/browsertime/pull/1084).
* Make it easy to add trace categories on top of the default ones for Chrome. Use `--chrome.traceCategory` to add an category. Use it multiple times to add multiple categories [#1090](https://github.com/sitespeedio/browsertime/pull/1090).
* Gzip geckoProfile JSON. [#1062](https://github.com/sitespeedio/browsertime/pull/1062) and [#1064](https://github.com/sitespeedio/browsertime/pull/1064).
* Updated dependencies yargs, selenium, dayjs, sharp, get-port, execa and chrome-remote-interface [#1068](https://github.com/sitespeedio/browsertime/pull/1068) and [#1069](https://github.com/sitespeedio/browsertime/pull/1069)
* Retry three times if a URL fails to load (and refactor the loading code to make it easier to understand) [#1077](https://github.com/sitespeedio/browsertime/pull/1077)
* Upgraded the HAR Export Trigger for Firefox to 0.6.1 [#1078](https://github.com/sitespeedio/browsertime/pull/1078)
* Updated to Chrome 80 and Chromedriver 80 [#1162](https://github.com/sitespeedio/browsertime/pull/1162).
* Support for getting tcpdumps (desktop only). A very special thanks to [Martino Trevisan](https://github.com/marty90) that started to add the support long time ago. You probably want to dump the SSL keyolog file and you can do that like this: `SSLKEYLOGFILE=/path/to/file browsertime --tcpdump https://www.sitespeed.io` or in Docker `docker run --rm -v "$(pwd)":/browsertime -e SSLKEYLOGFILE=/browsertime/keylog.txt sitespeedio/browsertime https://www.sitespeed.io/ -n 1 --tcpdump`. Implemented in [#1159](https://github.com/sitespeedio/browsertime/pull/1159).

### Fixed
* Ignore certificate errors by default when we record with WPR [#1150](https://github.com/sitespeedio/browsertime/pull/1150)
* If Visual Metrics failed, the original error wasn't there in the log. Fixed by [#1149](https://github.com/sitespeedio/browsertime/pull/1149) 
* Fix so the devtools port is added only one time on Android [#1145](https://github.com/sitespeedio/browsertime/pull/1145)
* If Visual Metrics fails, let produce an error that ends up in the JSON [#1147](https://github.com/sitespeedio/browsertime/pull/1147) 
* Cleanup WPR code to use default page complete check [#1143](https://github.com/sitespeedio/browsertime/pull/1143)
* CDP bug when scripting, fixed in [#1153](https://github.com/sitespeedio/browsertime/pull/1153)
* If navigation never happens, make sure we log what's going on and fail hard by throwing an error [#1130](https://github.com/sitespeedio/browsertime/pull/1130).
* Fix so we log a correct error message when taking a screenshot fails [#1131](https://github.com/sitespeedio/browsertime/pull/1131).
* Fix so Chrome devtools trace log config default config is immutable [#1132](https://github.com/sitespeedio/browsertime/pull/1132).
* Convert the video from Android to 60 FPS and use a monospace font on OS X [#1134](https://github.com/sitespeedio/browsertime/pull/1134) and [#1136](https://github.com/sitespeedio/browsertime/pull/1136).
* Only start the HTTP server that is used by the extension for Firefox when it is actually needed (adding cookies/request headers etc) [#1137](https://github.com/sitespeedio/browsertime/pull/1137) and [#1139](https://github.com/sitespeedio/browsertime/pull/1139).
* Better error logs when Chrome fails to take screenshots and when page complete check timeouts [#1107](https://github.com/sitespeedio/browsertime/pull/1107)
* Increase to 5 tries (from 3) if navigation don't happen [#1124](https://github.com/sitespeedio/browsertime/pull/1124)
* Fix the bug where a frame is missed after ffmpeg transformation [#1122](https://github.com/sitespeedio/browsertime/pull/1122) - thank you [Sean Feng](https://github.com/sefeng211) for the PR
* Fix for Contentful Speed Index that sometimes failed [#1121](https://github.com/sitespeedio/browsertime/pull/1121) - thank you [Tarek Ziade](https://github.com/tarekziade)!
* Automatically skip getting the HAR on Android for Firefox since it disn't work [#1119](https://github.com/sitespeedio/browsertime/pull/1119).
* Fix for getting processStartTime on Android [#1118](https://github.com/sitespeedio/browsertime/pull/1118), thank you [Nick Alexander](https://github.com/ncalexan)!
* Removing the faulty extra wait if you navigates to the same URL [#1112](https://github.com/sitespeedio/browsertime/pull/1112)
* Partly fixed broken recording on Android [#1095](https://github.com/sitespeedio/browsertime/pull/1095)
* Fix calculating process time on Android (default setup for FF didn't work since refactor) [#1094](https://github.com/sitespeedio/browsertime/pull/1094).
* Use FFMPEG as default recorder for Firefox [#1103](https://github.com/sitespeedio/browsertime/pull/1103) (at least for now).
* Fixed so you can use Firefox preferences that has colon as value (using URLs was broken before) [#1101](https://github.com/sitespeedio/browsertime/pull/1101).
* Fix so that if Contentful Speed Index fail, we catch that [#1104](https://github.com/sitespeedio/browsertime/pull/1104).
* Remove the extra use of the pageCompleteWaitTime, we had re-used that config twice so after the page complete check run, we waited some extra seconds [#1087](https://github.com/sitespeedio/browsertime/pull/1087).
* Running geckoProfiler on Android was previously broken with a refactor. Fixed by [#1088](https://github.com/sitespeedio/browsertime/pull/1088).
* Fix font usage on macOS for video, thank you [Tarek Ziade](https://github.com/tarekziade) for the PR [#1089](https://github.com/sitespeedio/browsertime/pull/1089).
* Log screenshot errors when it happens so its easier to understand the root cause [#1070](https://github.com/sitespeedio/browsertime/pull/1070).
* Take screenshots before we run the JS to collect the metrics [#1071](https://github.com/sitespeedio/browsertime/pull/1071).
* Increased default max wait time per JavaScript from 80 s to 120 s [#1074](https://github.com/sitespeedio/browsertime/pull/1074).
* Verify that the orange div for the video exists before moving on [#1076](https://github.com/sitespeedio/browsertime/pull/1076).
* Progress data from Visual Metrics don't need stats [#1060](https://github.com/sitespeedio/browsertime/pull/1060).
* Refactor and fixed Firefox Android code in [#1058](https://github.com/sitespeedio/browsertime/pull/1058) and  [#1057](https://github.com/sitespeedio/browsertime/pull/1057).
* Simplified the HAR export code for Firefox [#1059](https://github.com/sitespeedio/browsertime/pull/1059).
* Testing the same URL multiple times in a script was broken when you recorded a video, fixed in [#1161](https://github.com/sitespeedio/browsertime/pull/1161), reported in [#2842](https://github.com/sitespeedio/sitespeed.io/issues/2842).
* Compare "bare" domain names in URL retry logic as equal. Thank you [Nick Alexander](https://github.com/ncalexan) for [#1158](https://github.com/sitespeedio/browsertime/pull/1158).

### Tech
* Refactor Firefox code in iteration and moved it to the Firefox delegate [#1100](https://github.com/sitespeedio/browsertime/pull/1100) and [#1102](https://github.com/sitespeedio/browsertime/pull/1102).
* Naming cleanup [#1079](https://github.com/sitespeedio/browsertime/pull/1079),

## 7.8.3 - 2019-12-18
### Fixed
* Sometimes [scripting](https://www.sitespeed.io/documentation/sitespeed.io/scripting/) can be hard to debug and the `--videoParams.debug` is your best friend. However before this fix the video wasn't stopped correctly if an error was thrown + if you hadn't started to test a url, the debug video also was broken [#1039](https://github.com/sitespeedio/browsertime/pull/1039).

## 7.8.2 - 2019-12-16
### Fixed
* Fix race in SeleniumRunner#runPrivilegedAsyncScript that broke Firefox windowRecorder, thank you [Barret Rennie](https://github.com/brennie) for the PR [#1037](https://github.com/sitespeedio/browsertime/pull/1037).

## 7.8.1 - 2019-12-16
### Fixed
* More sane logging if getting the HTML/body content for Chrome fails [#1036](https://github.com/sitespeedio/browsertime/pull/1036).
* Finally remove all calls to detect portal in Firefox when you use `--firefox.mozillaProPreferences` [#1035](https://github.com/sitespeedio/browsertime/pull/1035).

## 7.8.0 - 2019-12-16
### Added
* There's a new waot command in scripting `await commands.wait.byPageToComplete()` that waits for the configured page complete check to run. This is useful if you are running your own Selenium scripts and navigate through JavaScript and wants to wait for the page to finish loading [#1024](https://github.com/sitespeedio/browsertime/pull/1024).
* Take a screenshot from a script `await commands.screenshot.take('name')`. The screenshot is stored on disk for that page and in later releases it will be included in the result JSON file [#1032](https://github.com/sitespeedio/browsertime/pull/1032).

### Fixed
* A little safer check when getting the alias for page in scripting [#1031](https://github.com/sitespeedio/browsertime/pull/1031)
* When getting content for a page to include in the HAR, we used to fail hard on first failure for Chrome. Now we catch that and try with the next response [#1029](https://github.com/sitespeedio/browsertime/pull/1029).
* Android testing was broken since 7.6.1 with the setting of user preferences that Android on Chrome don't support [#1034](https://github.com/sitespeedio/browsertime/pull/1034).

## 7.7.1 - 2019-12-12
### Fixed
* Catch when Visual Elements fails in Visual Metrics [#1026](https://github.com/sitespeedio/browsertime/pull/1026).

## 7.7.0 - 2019-12-11
### Added
* Upgraded to Chrome and Chromedriver 79 [#1025](https://github.com/sitespeedio/browsertime/pull/1025).

## 7.6.1 - 2019-12-10
### Fixed
* Disable password save popup in Chrome [#1022](https://github.com/sitespeedio/browsertime/pull/1022). When we removed the Browsertime extension for Chrome, the save popup was added again.

## 7.6.0 - 2019-12-07
### Added
* Disable safe browsing per default for Firefox. Enable it with `--firefox.disableSafeBrowsing false`[#1029](https://github.com/sitespeedio/browsertime/pull/1019).
* Disable traffic to detect portal for Firefox when you use `--firefox.mozillaProPreferences` [#1202](https://github.com/sitespeedio/browsertime/pull/1020).

## 7.5.0 - 2019-12-06
### Added
* Added Firefox 71 in the Docker container.
* Added Firefox preferences from the Mozilla Performance Team to get as stable metrics as possible. Enable it with `--firefox.mozillaProPreferences` [#1016](https://github.com/sitespeedio/browsertime/pull/1016).

## 7.4.2 - 2019-12-05
### Fixed
* Fix so that your own metrics (added by `measure.add` live in the same namespace (extras) both per run and in the statistics [#1015](https://github.com/sitespeedio/browsertime/pull/1015).

## 7.4.1 - 2019-12-04
### Fixed
* A better fix for handling Arabic characters in the URL [#1012](https://github.com/sitespeedio/browsertime/pull/1012).
* Catch if Contentful Speed Index fails [#1014](https://github.com/sitespeedio/browsertime/pull/1014)

## 7.4.0 - 2019-12-04
### Added
* Added configurable settle time for the browser to rest after the browser is open and before the tests starts to run. Use `--timeToSettle` in ms [#1003](https://github.com/sitespeedio/browsertime/pull/1003).
* Calculate FID instead of just report it [#1005](https://github.com/sitespeedio/browsertime/pull/1005)
* You can now run ADB shell directly from your user script [#1007](https://github.com/sitespeedio/browsertime/pull/1007). Use `commands.android.shell('')`.
* Add your own metrics from your script. The metrics will be in the result JSON and statistics will be calculated for that metric. Use `commands.measure.add(name, value)` or `commands.measure.addObject(object)` if you want to add multiple metrics. Documentation coming soon [#1011](https://github.com/sitespeedio/browsertime/pull/1011)

### Fixed
* Arabic characters didn't work in URLs, fixed in [#1009](https://github.com/sitespeedio/browsertime/pull/1009).
* Remove and simplify old code when running with pageLoadStrategy none. Introducing `--pageCompleteCheckStartWait` - The time in ms to wait for running the page complete check for the first time. Use this when you have a pageLoadStrategy set to none. [#1008](https://github.com/sitespeedio/browsertime/pull/1008)
* Better guards when calculating Visual Metrics [#1006](https://github.com/sitespeedio/browsertime/pull/1006).
* Fix for the using the Window recorder in Firefox 72. Thank you [Barret Rennie](https://github.com/brennie) for the PR [#995](https://github.com/sitespeedio/browsertime/pull/995).

## 7.3.0 - 2019-11-28
### Added
* Collect number of DOM elements as a part of the page info for each run [#1000](https://github.com/sitespeedio/browsertime/pull/1000).
* Configure how often to check for the pageCompleteCheck. Default is every 200 ms, and it happens after the load event end (using the default pageLoadStrategy). Set it with `--pageCompleteCheckPollTimeout`(value in ms) [#998](https://github.com/sitespeedio/browsertime/pull/998).

### Fixed
* Added missing pageLoadStrategy option in the CLI. The option worked but no visible cli help for it [#1001](https://github.com/sitespeedio/browsertime/pull/1001).
* Do not load the Browsertime WebExtention for Chrome (it is not used anymore) and make it possible for Firefox to disable to use it with `--firefox.disableBrowsertimeExtension`.

##  7.2.2 - 2019-11-22
### Fixed
* There was a bug introduced in 7.0.0 that made navigation fail on Safari [#997](https://github.com/sitespeedio/browsertime/pull/997).
* NPM was broken for 7.2.1

##  7.2.0 - 2019-11-22
### Added
* Get phone and Android version from the phone [#991](https://github.com/sitespeedio/browsertime/pull/991).

### Fixed
* Take care of the case when a page overwrites the document.URL [#992](https://github.com/sitespeedio/browsertime/pull/992).
* Stop the video recording when the test finished and not after we collected all JavaScript metrics [#994](https://github.com/sitespeedio/browsertime/pull/994).

## 7.1.0 -  2019-11-14
### Added
* Added Total Blocking Time (ttb) and maxPotentailFid in [#990](https://github.com/sitespeedio/browsertime/pull/990). This only works in Chrome at the moment, enable wiith `--cpu`.

## 7.0.2 - 2019-11-13
### Fixed
* Use CDP to get Chrome name and version (instead of JS). This gives us the Chromee version used when running emulated mobile [#988](https://github.com/sitespeedio/browsertime/pull/988).
* Add a HTML body of the first test page (that becomes orange) when we test with `--spa` [#987](https://github.com/sitespeedio/browsertime/pull/987).

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
3
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
