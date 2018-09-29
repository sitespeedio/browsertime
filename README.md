# Browsertime - Your browser, your page, your scripts!
[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![Downloads total][downloads-total-image]][downloads-url]
[![Stars][stars-image]][stars-url]

[Documentation](https://www.sitespeed.io/documentation/browsertime/) | [Changelog](https://github.com/sitespeedio/browsertime/blob/master/CHANGELOG.md)

![Browsertime](browsertime.png)

Access the Web Performance Timeline, from your browser, in your terminal!

## Introduction

**Browsertime lets you *automate running JavaScript in your browser* primary used to collect performance metrics. What exactly does that mean?**

We think of a Browsertime as having four key capabilities:

 - It handles everything with the browser (Firefox/Chrome).
 - It executes a batch of default and configurable JavaScript when the URL has finished loading in the browser.
 - It records a video of the Browser screen used to calculate Visual Metrics.
 - It lets you run Selenium scripts before and after the browser access the URL (to login a user etc).

**What is Browsertime good for?**

It is usually used for two different things:

 - You run it as a standalone tool to collect performance timing metrics of your web site.
 - You integrate it in your tool as a JavaScript runner that collects whatever JavaScript metrics/information you want.

To understand how Browsertime does these things, let's talk about how it works. Here's an example of what happens when you give Browsertime a URL to test:

1. You give your configuration to Browsertime.
2. Browsertime uses the [WebDriver](https://www.w3.org/TR/webdriver/) (through [Selenium](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html)) to start Firefox and Chrome (the implementations for the Webdriver is [Chromedriver](https://sites.google.com/a/chromium.org/chromedriver/)/[Geckodriver](https://github.com/mozilla/geckodriver/)).
3. Browsertime starts FFMPEG to record a video of the browser screen
4. The browser access the URL.
5. When the page is finished loading (you can define yourself when that happens), Browsertime executes the default JavaScript timing metrics and collects:
   - [Navigation Timing metrics](http://kaaes.github.io/timing/info.html)
   - [User Timing metrics](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/)
   - First paint
   - [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex).
6. It also collects a [HAR](http://www.softwareishard.com/blog/har-12-spec/) file that shows all requests/responses on the page.
7. FFMpeg is stopped and the video is analysed. Browsertime collect Visual Metrics like Speed Index.

The result of the run is a JSON file with all the JavaScript metrics collected, a HAR file, a video recording of the screen and a screenshot.

## A simple example

Use our Docker image (with Chrome, Firefox, XVFB and the dependencies needed to record a video):
<pre>
$ docker run --shm-size=1g --rm -v "$(pwd)":/browsertime sitespeedio/browsertime https://www.sitespeed.io/
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
Browsertime supports Firefox and Chrome on desktop. On Android we support Chrome.

But we want to [support Opera (on Android)](https://github.com/tobli/browsertime/issues/150)  and when(?!) iOS Safari supports WebDriver we will add that too.

## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, load a URL, executes configurable Javascripts to collect metrics, collect a HAR file.

To get the HAR from Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and Chrome we use [Chrome-HAR](https://github.com/sitespeedio/chrome-har) to parse the timeline log and generate the HAR file.

Oh and you can run your own Selenium script before (<code>--preScript</code>) and after (<code>--postScript</code>) a URL is accessed so you can login/logout or do whatever you want.

# Speed Index and video
It's easiest to run [our ready made Docker container](https://hub.docker.com/r/sitespeedio/browsertime/) to be able to record a video and calculate SpeedIndex because then you get all dependencies needed for free to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

The default video will include a timer and showing when the metrics happens, but you can turn that off using <code>--video.addTimer false</code>.

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/video-example.gif">

## Test using Docker
You can build and test changes using Docker locally.

<pre>
$ docker build -t sitespeedio/browsertime .
$ docker run --shm-size=1g --rm -v "$(pwd)":/browsertime sitespeedio/browsertime -n 1 https://www.sitespeed.io/
</pre>

## Connectivity

You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to setup a network bridge in Docker or use our connectivity engine Throttle.


Here's an full example to setup up Docker network bridges on a server that has tc installed:

~~~bash
#!/bin/bash
echo 'Starting Docker networks'
docker network create --driver bridge --subnet=192.168.33.0/24 --gateway=192.168.33.10 --opt "com.docker.network.bridge.name"="docker1" 3g
tc qdisc add dev docker1 root handle 1: htb default 12
tc class add dev docker1 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker1 parent 1:12 netem delay 150ms

docker network create --driver bridge --subnet=192.168.34.0/24 --gateway=192.168.34.10 --opt "com.docker.network.bridge.name"="docker2" cable
tc qdisc add dev docker2 root handle 1: htb default 12
tc class add dev docker2 parent 1:1 classid 1:12 htb rate 5mbit ceil 5mbit
tc qdisc add dev docker2 parent 1:12 netem delay 14ms

docker network create --driver bridge --subnet=192.168.35.0/24 --gateway=192.168.35.10 --opt "com.docker.network.bridge.name"="docker3" 3gfast
tc qdisc add dev docker3 root handle 1: htb default 12
tc class add dev docker3 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker3 parent 1:12 netem delay 75ms

docker network create --driver bridge --subnet=192.168.36.0/24 --gateway=192.168.36.10 --opt "com.docker.network.bridge.name"="docker4" 3gem
tc qdisc add dev docker4 root handle 1: htb default 12
tc class add dev docker4 parent 1:1 classid 1:12 htb rate 0.4mbit ceil 0.4mbit
tc qdisc add dev docker4 parent 1:12 netem delay 200ms
~~~

Then when you run your container you add the network with <code>--network cable</code>. You should also tell Browsertime that you set the connectivity external from BT. A full example running running with cable:

~~~bash
$ docker run --shm-size=1g --network=cable --rm sitespeedio/browsertime -c cable --connectivity.engine external https://www.sitespeed.io/
~~~

And using the 3g network:

~~~bash
$ docker run --shm-size=1g --network=3g --rm sitespeedio/browsertime -c 3g --connectivity.engine external https://www.sitespeed.io/
~~~

And if you want to remove the networks:

~~~bash
#!/bin/bash
echo 'Stopping Docker networks'
docker network rm 3g
docker network rm 3gfast
docker network rm 3gem
docker network rm cable
~~~

Throttle uses *tc* on Linux and *pfctl* on Mac to change the connectivity. Throttle will need sudo rights for the user running sitespeed.io to work.

To use throttle, use set the connectivity engine by *--connectivity.engine throttle*.

~~~bash
browsertime --connectivity.engine throttle -c cable https://www.sitespeed.io/
~~~

You can also use Throttle inside of Docker but then the host need to be the same OS as in Docker. In practice you can only use it on Linux. And then make sure to run *sudo modprobe ifb numifbs=1* first and give the container the right privileges *--cap-add=NET_ADMIN*.

## Test on your mobile device
Browsertime supports Chrome on Android: Collecting SpeedIndex, HAR and video! This is still really new, let us know if you find any bugs.

You need to [install adb](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#desktop) and [prepare your phone](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#on-your-phone) before you start.

If you want to set connectivity you need to use something like [Micro device lab](https://github.com/phuedx/micro-device-lab) or [TSProxy](https://github.com/WPO-Foundation/tsproxy).

<pre>
$ browsertime --chrome.android.package com.android.chrome https://www.sitespeed.io --video --visualMetrics
</pre>

If you are on Linux (we have tested Ubuntu 16) you can use our Docker container to drive your Android phone. A couple of things to remember:
 * You need to run in privileged mode *--privileged*
 * You need to share the USB ports *-v /dev/bus/usb:/dev/bus/usb*
 * Add *-e START_ADB_SERVER=true* to start the adb server
 * Turn of xvfb *--xvfb false* (we start that automatically)

If you use Docker you will automatically get support for video and SpeedIndex. You can get that without Docker but then need to [install VisualMetrics dependencies](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) yourself.

<pre>
$ docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --shm-size=1g --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime -n 1 --chrome.android.package com.android.chrome --xvfb false --visualMetrics --video https://en.m.wikipedia.org/wiki/Barack_Obama
</pre>

## Configuration
Run <code>$ bin/browsertime.js --help</code> and you can see the configuration options.

## Using WebPageReplay
Our Docker container now included [WebPageReplay](https://github.com/catapult-project/catapult/blob/master/web_page_replay_go/README.md).

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
docker run --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime:3.0.0 https://en.wikipedia.org/wiki/Barack_Obama
```

Use Firefox:

```
docker run --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime:3.0.0 -b firefox -n 11 https://en.wikipedia.org/wiki/Barack_Obama
```

And Chrome on your Android phone. This will only work on Linux because you need to be able to mount the usb port in Docker:

```
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --cap-add=NET_ADMIN --shm-size=1g --rm -v “$(pwd)“:/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime https://en.m.wikipedia.org/wiki/Barack_Obama --chrome.android.package com.android.chrome --xvfb false --chrome.args ignore-certificate-errors-spki-list=PhrPvGIaAMmd29hj8BCZOq096yj7uMpRNHpn5PDxI6I= -n 11 --chrome.args user-data-dir=/data/tmp/chrome
```

## Send metrics to Graphite
The easiest way to send metrics is to install [jq](https://stedolan.github.io/jq/) and use it to pick the values you wanna track.

Here's an example on how you can pickup the median SpeedIndex from Browsertime and send it to your Graphite instance.
<pre>
echo "browsertime.your.key.SpeedIndex.median" $(cat /tmp/browsertime/browsertime.json | jq .statistics.visualMetrics.SpeedIndex.median) "`date +%s`" | nc -q0 my.graphite.com 2003
</pre>

[travis-image]: https://img.shields.io/travis/sitespeedio/browsertime.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/browsertime
[stars-url]: https://github.com/tobli/sitespeedio/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/browsertime.svg?style=flat-square
[downloads-total-image]: https://img.shields.io/npm/dt/browsertime.svg?style=flat-square
[downloads-image]: https://img.shields.io/npm/dm/browsertime.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/browsertime
