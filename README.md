# Browsertime
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

## Table of Contents

# Browsertime: Measure and Optimize Web Performance

Browsertime is a powerful, open-source Node.js tool designed for engineers who are building their own performance measurement tools. It serves as the core engine of projects like sitespeed.io and is a trusted tool used by Mozilla to measure the performance of Firefox.

## Key Features

- **Robust Performance Testing:** Browsertime allows you to perform comprehensive performance tests on your web pages, including page load times, resource loading, and user interactions.

- **Deep Metrics:** Gain access to a wide range of performance metrics, such as page load times, visual metrics (when things are painted on the screen), largest contentful paint (LCP), and more, helping you pinpoint areas for improvement.

- **Scripting Capabilities:** Customize your tests and user interactions with JavaScript scripting, enabling advanced scenarios and detailed analysis.

- **Docker Support:** Easily integrate Browsertime into your CI/CD pipelines and containerized environments with Docker support.


## For Performance Monitoring Systems

If you're looking for a comprehensive performance monitoring system, we recommend exploring the larger project, [sitespeed.io](https://github.com/sitespeedio/sitespeed.io). Sitespeed.io builds upon Browsertime and provides a complete solution for continuous performance monitoring and optimization of your web applications.

## Get Started with Browsertime

If you're an engineer working on performance measurement tools or simply want to harness the power of Browsertime for your web performance needs, follow the installation and usage instructions below.


### Running NodeJS version
```
npm install -g browsertime
browsertime https://example.com
```

### Using Docker
```
docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime https://www.sitespeed.io/
```

## I want more examples
Checkout the [examples](docs/examples/README.md).

## Browsers
Browsertime supports Firefox, Chrome, and Edge (Chromium version) on desktop and Safari on Mac OS. On Android we support Chrome and Firefox. Safari on iOS has limited support: there's no HAR file and no visual metrics. You can also use the Safari simulator on Mac OS.

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

If you want to set connectivity you need to use something like [gnirehtet](https://github.com/Genymobile/gnirehtet). Read more information [here](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#connectivity).

<pre>
$ browsertime --chrome.android.package com.android.chrome https://www.sitespeed.io --video --visualMetrics
</pre>

## Configuration
Run <code>$ bin/browsertime.js --help</code> and you can see the configuration options.

## Using WebPageReplay
Our Docker container now includes [WebPageReplay](https://github.com/catapult-project/catapult/blob/main/web_page_replay_go/README.md).

WebPageReplay will let you replay your page locally (getting rid of server latency) and makes it easier to find front end regressions.

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
