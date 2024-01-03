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

# Browsertime: Measure and Optimize Web Performance

Browsertime is a powerful, open-source Node.js tool designed for engineers who are building their own performance measurement tools. It serves as the core engine of projects like sitespeed.io and is a trusted tool used by Mozilla to measure the performance of Firefox.

# Table of Contents
1. [Introduction](#browsertime-measure-and-optimize-web-performance)
2. [Key Features](#key-features)
3. [Installation](#installation)
    - [NodeJS](#nodejs)
    - [Docker](#docker)
4. [Usage](#usage)
    - [Basic Usage](#basic-usage)
    - [Advanced Options](#advanced-options)
    - [Connectivity](#connectivity)
    - [Navigate in a script](#navigate-in-a-script)
    - [Test on your mobile device](#test-on-your-mobile-device)
    - [Using WebPageReplay](#using-webpagereplay)
    - [Speed Index and video](#speed-index-and-video)
5. [Browser Support](#browser-support)
6. [How does it work](#how-does-it-work)
7. [Contributing](#contributing)
9. [Community and Support](#community-and-support)
9. [License](#license)

## Key Features

- **Robust Performance Testing:** Browsertime allows you to perform comprehensive performance tests on your web pages, including page load times, resource loading, and user interactions.

- **Deep Metrics:** Gain access to a wide range of performance metrics, such as page load times, visual metrics (when things are painted on the screen), largest contentful paint (LCP), and more, helping you pinpoint areas for improvement.

- **Scripting Capabilities:** Customize your tests and user interactions with JavaScript scripting, enabling advanced scenarios and detailed analysis.

- **Docker Support:** Easily integrate Browsertime into your CI/CD pipelines and containerized environments with Docker support.
##

## Installation

If you're an engineer working on performance measurement tools or simply want to harness the power of Browsertime for your web performance needs, follow the installation and usage instructions below.

### NodeJS
```shell
npm install -g browsertime
browsertime https://example.com
```

### Docker
```shell
docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime https://www.sitespeed.io/
```

## Usage
Browsertime is designed to be straightforward to use, regardless of your experience level. Here's a quick guide on how to get started.

### Basic Usage

```shell
browsertime https://www.example.com --browser chrome
```

This command will test https://www.example.com using Chrome.

### Advanced Options

Browsertime offers various advanced options for more detailed analysis, such as specifying the number of runs, choosing a browser, or setting custom metrics. Here are some examples:

#### Run the test multiple times

```shell
browsertime -n 5 https://www.example.com
```

#### Specify a different browser
```shell
browsertime --browser firefox https://www.example.com
```

#### Custom metrics
```shell
browsertime --script "return {'myMetric': window.myApp.customMetric}" https://www.example.com
```

For a full list of options, run <code>$ browsertime --help</code> and you can see the configuration options.

#### Connectivity

You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to setup a network bridge in Docker or use our connectivity engine Throttle. Read more about how to do that in the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/connectivity/).

#### Navigate in a script
If you need a more complicated test scenario, you can define your own (Selenium)test script that will do the testing. Use your own test script when you want to test your page as a logged in user, the login page or if you want to add things to your cart.

We have a full section in the documentation about [scripting](https://www.sitespeed.io/documentation/sitespeed.io/scripting/).

#### Test on your mobile device
Browsertime supports Chrome and Firefox on Android: Collecting SpeedIndex, HAR and video! 

You need to [install adb](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#desktop) and [prepare your phone](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#on-your-phone) before you start.

If you want to set connectivity you need to use something like [gnirehtet](https://github.com/Genymobile/gnirehtet). Read more information [here](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#connectivity).

<pre>
$ browsertime --chrome.android.package com.android.chrome https://www.sitespeed.io --video --visualMetrics
</pre>

#### Using WebPageReplay
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
docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime:20.0.0 https://en.wikipedia.org/wiki/Barack_Obama
```

Use Firefox:

```shell
docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime:20.0.0 -b firefox -n 11 --firefox.acceptInsecureCerts true https://en.wikipedia.org/wiki/Barack_Obama
```

And Chrome on your Android phone. This will only work on Linux because you need to be able to mount the usb port in Docker:

```shell
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --cap-add=NET_ADMIN --rm -v “$(pwd)“:/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime https://en.m.wikipedia.org/wiki/Barack_Obama --android --chrome.args ignore-certificate-errors-spki-list=PhrPvGIaAMmd29hj8BCZOq096yj7uMpRNHpn5PDxI6I= -n 11 --chrome.args user-data-dir=/data/tmp/chrome
```

#### Speed Index and video
It's easiest to run [our ready made Docker container](https://hub.docker.com/r/sitespeedio/browsertime/) to be able to record a video and calculate SpeedIndex because then you get all dependencies needed for free to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

The default video will include a timer and showing when the metrics happens, but you can turn that off using <code>--video.addTimer false</code>.

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/video-example.gif">


## Browser Support
Browsertime supports Firefox, Chrome, and Edge (Chromium version) on desktop and Safari on Mac OS. On Android we support Chrome and Firefox. Safari on iOS has limited support: there's no HAR file and no visual metrics. You can also use the Safari simulator on Mac OS.

## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, load a URL, executes configurable Javascripts to collect metrics, collect a HAR file.

To get the HAR from Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and Chrome we use [Chrome-HAR](https://github.com/sitespeedio/chrome-har) to parse the timeline log and generate the HAR file.

## Contributing

We welcome contributions from the community! Whether you're fixing a bug, adding a feature, or improving documentation, your help is valuable. Here’s how you can contribute:

1. **Create an Issue**: Create an issue and discuss with us how to implement the issue.
2. **Fork and Clone**: Fork the repository and clone it locally.
3. **Create a Branch**: Create a new branch for your feature or bug fix.
4. **Develop**: Make your changes. Ensure you adhere to the coding standards and write tests if applicable.
5. **Test**: Run tests to ensure everything works as expected.
6. **Submit a Pull Request**: Push your changes to your fork and submit a pull request to the main repository.

Before contributing, please read our [CONTRIBUTING.md](.github/CONTRIBUTING.md) for more detailed information on how to contribute.

### Reporting Issues
Found a bug or have a feature request? Please use the [GitHub Issues](https://github.com/sitespeedio/browsertime/issues) to report them. Be sure to check existing issues to avoid duplicates.

## Community and Support

Join our community! Whether you need help, want to share your experience, or discuss potential improvements, there are several ways to get involved:

- **Slack**: Connect with fellow users and the development team on [Slack](https://join.slack.com/t/sitespeedio/shared_invite/zt-296jzr7qs-d6DId2KpEnMPJSQ8_R~WFw).
- **GitHub Issues**: For technical questions, feature requests, and bug reports, use our [GitHub issues](https://github.com/sitespeedio/browsertime/issues).
- **RSS/Changelog**: Latest releases and information can always be found in our [RSS feed](https://github.com/sitespeedio/browsertime/releases.atom) and in our [changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md).
- **Mastodon**: Follow us on Mastodon [https://fosstodon.org/@sitespeedio](https://fosstodon.org/@sitespeedio).

We're excited to have you in our community and look forward to your contributions and interactions!


## License
[Apache License version 2.0](LICENSE).

[travis-image]: https://img.shields.io/travis/sitespeedio/browsertime.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/browsertime
[stars-url]: https://github.com/tobli/sitespeedio/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/browsertime.svg?style=flat-square
[downloads-total-image]: https://img.shields.io/npm/dt/browsertime.svg?style=flat-square
[downloads-image]: https://img.shields.io/npm/dm/browsertime.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/browsertime
