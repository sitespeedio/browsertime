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

## A simple example

<pre>
$ bin/browsertime.js https://www.sitespeed.io
</pre>

Load https://www.sitespeed.io in Chrome three times. Results are stored in a json file (browsertime.json) with the timing data, and a har file (browsertime.har) in browsertime-results/www.sitespeed.io/$date/

## I want more examples
Checkout the [examples](docs/examples/README.md).

## Browsers
Browsertime supports Firefox and Chrome on desktop. On Android we support Chrome. Yep that's it for now.

But we want to support Opera (on Android) https://github.com/tobli/browsertime/issues/150 and when Safari 10 is available, we will add it too. And when(?!) iOS Safari supports WebDriver we will add that too.

## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, load a URL, executes configurable Javascripts to collect metrics, collect a HAR file.

To get the HAR from Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and Chrome we parse the timeline log and generates the HAR file.

Oh and you can run your own Selenium script before (<code>--preScript</code>) and after (<code>--postScript</code>) a URL is accessed so you can login/logout or do whatever you want.

## Test using Docker
You can build and test changes using Docker locally. Using Docker is cool because we have ready made containers with Firefox/Chrome and all the dependencies needed for running [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics) to get SpeedIndex.

<pre>
$ docker build -t sitespeedio/browsertime .
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime -n 1 --connectivity.engine tc -c cable --experimental.video https://www.sitespeed.io/
</pre>

## The rewrite to 1.0
The master is to a large degree a re-write of the internal implementation, the cli interface, and the node API. It's
based on learnings from the previous releases of Browsertime, and their use in Sitespeed.io. It's still lacking some features
from the 0.x releases, and the API is not final. However it should be a better foundation for future development, using
more modern Javascript features and a much more extensive test suite.

With 1.0 we dropped BrowsermobProxy so you don't need Java :smile: to run anymore and each run will be 1000% faster. Also we now support HTTP/2 and pre and post selenium scripts, if you want to do things before the URL is tested.

If you would would like to get started there are a few examples that can be found in the [docs folder](docs/examples/README.md). If you run into any issues getting started using Browsertime visit our [Issues Page](docs/issues.md) for some common issues/solutions. If you still cannot resolve the problem and feel the issue is within browsertime feel free to open an issue.

[travis-image]: https://img.shields.io/travis/sitespeedio/browsertime.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/browsertime
[stars-url]: https://github.com/tobli/sitespeedio/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/browsertime.svg?style=flat-square
[downloads-image]: http://img.shields.io/npm/dm/browsertime.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/browsertime
