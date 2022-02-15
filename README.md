# Browsertime - Your browser, your page, your scripts!
![Run Docker](https://github.com/sitespeedio/browsertime/actions/workflows/docker.yml/badge.svg?branch=main)
![Unit tests](https://github.com/sitespeedio/browsertime/actions/workflows/unittests.yml/badge.svg?branch=main)
![Windows Edge](https://github.com/sitespeedio/browsertime/actions/workflows/windows.yml/badge.svg?branch=main)
![OSX Safari](https://github.com/sitespeedio/browsertime/actions/workflows/safari.yml/badge.svg?branch=main)
![Linux browsers](https://github.com/sitespeedio/browsertime/actions/workflows/linux.yml/badge.svg?branch=main)
[![Downloads][downloads-image]][downloads-url]
[![Downloads total][downloads-total-image]][downloads-url]
[![Stars][stars-image]][stars-url]

[Documentation](https://www.sitespeed.io/documentation/browsertime/) | [Changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md)

![Browsertime](browsertime.png)

Access the Web Performance Timeline, from your browser, in your terminal!

## Introduction

**Browsertime lets you *automate running JavaScript in your browser* primary used to collect performance metrics. What exactly does that mean?**

We think of a Browsertime as having four key capabilities:

 - It handles everything with the browser (Firefox/Chrome/Edge/Safari and other browser that can be driven using WebDriver).
 - It executes a batch of default and configurable JavaScript when the URL has finished loading in the browser.
 - It records a video of the Browser screen used to calculate [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics).
 - It lets you run your [scripting file to create and measure your users journey](https://www.sitespeed.io/documentation/sitespeed.io/scripting/).

**What is Browsertime good for?**

It is usually used for two different things:

 - You run it as a standalone tool to collect performance timing metrics of your web site.
 - You integrate it in your tool as a JavaScript runner that collects whatever JavaScript metrics/information you want.

To understand how Browsertime do these things, let's talk about how it works. Here's an example of what happens when you give Browsertime a URL to test:

1. You give your configuration to Browsertime.
2. Browsertime uses the [WebDriver](https://www.w3.org/TR/webdriver/) (through [Selenium](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html)) to start Firefox/Chrome/Safari/Edge.
3. Browsertime starts FFMPEG to record a video of the browser screen
4. The browser access the URL.
5. When the page is finished loading (you can define yourself when that happens), Browsertime collects:
   - [Navigation Timing metrics](http://kaaes.github.io/timing/info.html)
   - [User Timing metrics](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/)
   - [Element Timing metrics](https://wicg.github.io/element-timing/)
   - [Paint Timings](https://w3c.github.io/paint-timing/)
   - [Googles Web Vitals](https://web.dev/vitals/)
   - [CPU metrics CPU Long Tasks]((https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API))
6. You can also collect internal trace logs from the browser using `--firefox.geckoProfiler` for Firefox and `--chrome.timeline` for Chromium browsers.
7. It also collects a [HAR](http://www.softwareishard.com/blog/har-12-spec/) file that shows all requests/responses on the page.
8. FFMpeg is stopped and the video is analysed. Browsertime collect Visual Metrics like Speed Index, First Visual Change and Last Visual Change.

The result of the run is a JSON file with all the JavaScript metrics collected, a HAR file, a video recording of the screen and a screenshot.

## A simple example

Use our Docker image (with Chrome, Firefox, Edge, XVFB and the dependencies needed to record a video):
<pre>
$ docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime https://www.sitespeed.io/
</pre>

Or using node:
<pre>
$ npm install browsertime -g
$ browsertime https://www.sitespeed.io/
</pre>

Load https://www.sitespeed.io/ in Chrome three times. Results are stored in a JSON file (browsertime.json) with the timing data, and a HAR file (browsertime.har) in browsertime-results/www.sitespeed.io/$date/

## I want more examples
Checkout the [examples](docs/examples/README.md).

## Browsers
Browsertime supports Firefox, Chrome, and Edge (Chromium version) on desktop and Safari on Mac OS. On Android we support Chrome and Firefox (from 8.0) and Safari on iOS. You can also use the Safari simulator on Mac OS.

## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, load a URL, executes configurable Javascripts to collect metrics, collect a HAR file.

To get the HAR from Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and Chrome we use [Chrome-HAR](https://github.com/sitespeedio/chrome-har) to parse the timeline log and generate the HAR file.

# Speed Index and video
It's easiest to run [our ready made Docker container](https://hub.docker.com/r/sitespeedio/browsertime/) to be able to record a video and calculate SpeedIndex because then you get all dependencies needed for free to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

The default video will include a timer and showing when the metrics happens, but you can turn that off using <code>--video.addTimer false</code>.

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/video-example.gif">

## Test using Docker
You can build and test changes using Docker locally.

<pre>
$ docker build -t sitespeedio/browsertime .
$ docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime -n 1 https://www.sitespeed.io/
</pre>

## Connectivity

You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to setup a network bridge in Docker or use our connectivity engine Throttle. Read more about how to do that in the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/connectivity/).


## Navigate in a script
If you need a more complicated test scenario, you can define your own (Selenium)test script that will do the testing. Use your own test script when you want to test your page as a logged in user, the login page or if you want to add things to your cart.

We have a full section in the documentation about [scripting](https://www.sitespeed.io/documentation/sitespeed.io/scripting/).

## Test on your mobile device
Browsertime supports Chrome and Firefox on Android: Collecting SpeedIndex, HAR and video! 

You need to [install adb](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#desktop) and [prepare your phone](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#on-your-phone) before you start.

If you want to set connectivity you need to use something like [gnirehtet](https://github.com/Genymobile/gnirehtet) or [TSProxy](https://github.com/WPO-Foundation/tsproxy). Read more information [here](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#connectivity).

<pre>
$ browsertime --chrome.android.package com.android.chrome https://www.sitespeed.io --video --visualMetrics
</pre>

If you are on Linux (we have tested Ubuntu 18) you can use our Docker container to drive your Android phone. A couple of things to remember:
 * You need to run in privileged mode *--privileged* if you share the full usb bus
 * You need to share the USB ports *-v /dev/bus/usb:/dev/bus/usb* or share a specific port with *--device=/dev/bus/usb/001/017* (use *lsusb* to find the right mapping)
 * Add *-e START_ADB_SERVER=true* to start the adb server

If you use Docker you will automatically get support for video and SpeedIndex. You can get that without Docker but then need to [install VisualMetrics dependencies](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/main/Dockerfile) yourself.

<pre>
$ docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime -n 1 --android --visualMetrics --video https://en.m.wikipedia.org/wiki/Barack_Obama
</pre>

## Configuration
Run <code>$ bin/browsertime.js --help</code> and you can see the configuration options.

## Using WebPageReplay
Our Docker container now included [WebPageReplay](https://github.com/catapult-project/catapult/blob/main/web_page_replay_go/README.md).

WebPageReplay will let you replay your page locally (getting rid of server latency etc) and makes it easier to find front end regressions.

It works like this:
1. The start script starts WebPageReplay in record mode
2. Then starts Browsertime accessing the URL you choose one time (so it is recorded)
3. WebPageReplay is closed down
4. WebPageReplay in replay mode is started
5. Browsertime access the URL so many times you choose
6. WebPageReplay in replay mode is closed down

You can change latency by setting a Docker environment variable. Use REPLAY to turn on the reply functionality.

Default browser is Chrome:

```
docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime:12.0.0 https://en.wikipedia.org/wiki/Barack_Obama
```

Use Firefox:

```
docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime:12.0.0 -b firefox -n 11 --firefox.acceptInsecureCerts https://en.wikipedia.org/wiki/Barack_Obama
```

And Chrome on your Android phone. This will only work on Linux because you need to be able to mount the usb port in Docker:

```
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --cap-add=NET_ADMIN --rm -v “$(pwd)“:/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime https://en.m.wikipedia.org/wiki/Barack_Obama --android --chrome.args ignore-certificate-errors-spki-list=PhrPvGIaAMmd29hj8BCZOq096yj7uMpRNHpn5PDxI6I= -n 11 --chrome.args user-data-dir=/data/tmp/chrome
```

## Send metrics to Graphite
The easiest way to send metrics is to install [jq](https://stedolan.github.io/jq/) and use it to pick the values you wanna track.

Here's an example on how you can pickup the median SpeedIndex from Browsertime and send it to your Graphite instance.
<pre>
echo "browsertime.your.key.SpeedIndex.median" $(cat /tmp/browsertime/browsertime.json | jq .[0].statistics.visualMetrics.SpeedIndex.median) "`date +%s`" | nc -q0 my.graphite.com 2003
</pre>

[travis-image]: https://img.shields.io/travis/sitespeedio/browsertime.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/browsertime
[stars-url]: https://github.com/tobli/sitespeedio/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/browsertime.svg?style=flat-square
[downloads-total-image]: https://img.shields.io/npm/dt/browsertime.svg?style=flat-square
[downloads-image]: https://img.shields.io/npm/dm/browsertime.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/browsertime
