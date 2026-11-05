# Browsertime
[![unit tests](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/unittests.yml?branch=main&label=unit%20tests&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/unittests.yml)
[![lint](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/lint.yml?branch=main&label=lint&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/lint.yml)
[![linux chrome](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/linux-chrome.yml?branch=main&label=linux%20chrome&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/linux-chrome.yml)
[![linux firefox](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/linux-firefox.yml?branch=main&label=linux%20firefox&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/linux-firefox.yml)
[![linux firefox wayland](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/linux-firefox-wayland.yml?branch=main&label=linux%20firefox%20wayland&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/linux-firefox-wayland.yml)
[![windows](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/windows.yml?branch=main&label=windows&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/windows.yml)
[![mac](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/mac.yml?branch=main&label=mac&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/mac.yml)
[![safari](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/safari.yml?branch=main&label=safari&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/safari.yml)
[![safari m1](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/mac-m1.yml?branch=main&label=safari%20m1&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/mac-m1.yml)
[![docker](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/docker.yml?branch=main&label=docker&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/docker.yml)
[![visual metrics](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/visualmetrics.yml?branch=main&label=visual%20metrics&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/visualmetrics.yml)
[![beta](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/browser-beta.yml?branch=main&label=beta&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/browser-beta.yml)
[![dev](https://img.shields.io/github/actions/workflow/status/sitespeedio/browsertime/browser-dev.yml?branch=main&label=dev&style=flat-square)](https://github.com/sitespeedio/browsertime/actions/workflows/browser-dev.yml)

[![npm][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Downloads total][downloads-total-image]][npm-url]
[![Docker pulls][docker-image]][docker-url]
[![License][license-image]][license-url]
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
8. [Community and Support](#community-and-support)
9. [License](#license)

## Key Features

- **Robust Performance Testing:** Browsertime allows you to perform comprehensive performance tests on your web pages, including page load times, resource loading, and user interactions.

- **Deep Metrics:** Gain access to a wide range of performance metrics, such as page load times, visual metrics (when things are painted on the screen), largest contentful paint (LCP), and more, helping you pinpoint areas for improvement.

- **Scripting Capabilities:** Customize your tests and user interactions with JavaScript scripting, enabling advanced scenarios and detailed analysis.

- **Docker Support:** Easily integrate Browsertime into your CI/CD pipelines and containerized environments with Docker support.

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
Put the JavaScript that collects your metric in a file, for example `myMetric.js`:

```javascript
(function () {
  return window.myApp.customMetric;
})();
```

Then add the file with `--script`. The value is in the `custom` category in the result JSON. You can also give a folder, then each `.js` file in it becomes a metric and the folder name is the category:

```shell
browsertime --script myMetric.js https://www.example.com
```

For a full list of options, run <code>$ browsertime --help</code> and you can see the configuration options.

#### Connectivity

You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to setup a network bridge in Docker or use our connectivity engine Throttle. Read more about how to do that in the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/connectivity/).

#### Navigate in a script
If you need a more complicated test scenario, you can define your own (Selenium)test script that will do the testing. Use your own test script when you want to test your page as a logged in user, the login page or if you want to add things to your cart.

We have a full section in the documentation about [scripting](https://www.sitespeed.io/documentation/sitespeed.io/scripting/).

#### Test on your mobile device
Browsertime supports Chrome, Firefox and Edge on Android: Collecting SpeedIndex, HAR and video!

You need to [install adb](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#desktop) and [prepare your phone](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#on-your-phone) before you start.

If you want to set connectivity you need to use something like [gnirehtet](https://github.com/Genymobile/gnirehtet). Read more information [here](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#connectivity).

<pre>
$ browsertime --chrome.android.package com.android.chrome https://www.sitespeed.io --video --visualMetrics
</pre>

To test with Samsung Internet, use `--android --chrome.android.package com.sec.android.app.sbrowser`. Samsung Internet shows a welcome screen when its data is removed, so Browsertime keeps its data and clears the cache and cookies before each test instead. Before the first test, open Samsung Internet on the phone and accept the welcome screen. Local storage and service workers are kept between tests. If the phone uses a dark theme, Samsung Internet also shows web pages in dark mode: turn that off in the Samsung Internet settings to test the pages as most users see them.

To check that all Android features work with your phone, run `npm run test:android` in a Browsertime checkout. It tests Chrome and Firefox (use `npm run test:android -- --browser chrome` or `-- --browser firefox` to test only one) and prints which features pass. Add `-- --rooted` to also test `--android.rooted`, which changes the CPU, GPU and kernel settings on the phone until it reboots.

#### Using WebPageReplay
Our Docker container includes [WebPageReplay](https://chromium.googlesource.com/webpagereplay/).

WebPageReplay will let you replay your page locally (getting rid of server latency) and makes it easier to find front end regressions.

It works like this:
1. The start script starts WebPageReplay in record mode
2. Then starts Browsertime accessing the URL you choose one time (so it is recorded)
3. WebPageReplay is closed down
4. WebPageReplay in replay mode is started
5. Browsertime access the URL so many times you choose
6. WebPageReplay in replay mode is closed down

You can change latency by setting a Docker environment variable. Use REPLAY to turn on the replay functionality.

Default browser is Chrome:

```
docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime https://en.wikipedia.org/wiki/Barack_Obama
```

Use Firefox:

```shell
docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime -b firefox -n 11 --firefox.acceptInsecureCerts true https://en.wikipedia.org/wiki/Barack_Obama
```

And Chrome on your Android phone. This will only work on Linux because you need to be able to mount the usb port in Docker:

```shell
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --cap-add=NET_ADMIN --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime https://en.m.wikipedia.org/wiki/Barack_Obama --android --chrome.args ignore-certificate-errors-spki-list=PhrPvGIaAMmd29hj8BCZOq096yj7uMpRNHpn5PDxI6I= -n 11 --chrome.args user-data-dir=/data/tmp/chrome
```

#### Speed Index and video
It's easiest to run [our ready made Docker container](https://hub.docker.com/r/sitespeedio/browsertime/), because it has all the dependencies and records a video and calculates Visual Metrics by default. Without Docker, add `--video --visualMetrics` and install FFmpeg and Python 3 with the packages in [requirements.txt](requirements.txt) (Numpy and Pillow, and OpenCV-Python only for `--visualMetricsContentful`). The Visual Metrics script is based on [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics) from WebPageTest.

The default video will include a timer and showing when the metrics happens, but you can turn that off using <code>--videoParams.addTimer false</code>.

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/video-example.gif">


## Browser Support
Browsertime supports Firefox, Chrome, and Edge (Chromium version) on desktop and Safari on Mac OS. On Android we support Chrome, Firefox and Edge. Safari on iOS supports HAR (via `ios_webkit_debug_proxy`) and video / visual metrics (via screen capture over USB). You can also use the Safari simulator on Mac OS.

## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, loads a URL, executes configurable JavaScripts to collect metrics and collects a HAR file.

To get the HAR from Firefox we use [bidi-har-export](https://github.com/firefox-devtools/bidi-har-export), which creates the HAR from WebDriver BiDi network events. For Chrome and Edge we use [Chrome-HAR](https://github.com/sitespeedio/chrome-har) to create the HAR from the Chrome DevTools Protocol network events. Safari on iOS also uses Chrome-HAR, with the events from the WebKit inspector protocol. Desktop Safari does not give a HAR.

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


We're excited to have you in our community and look forward to your contributions and interactions!


## License
[Apache License version 2.0](LICENSE).

[npm-image]: https://img.shields.io/npm/v/browsertime.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/browsertime
[downloads-image]: https://img.shields.io/npm/dm/browsertime.svg?style=flat-square
[downloads-total-image]: https://img.shields.io/npm/dt/browsertime.svg?style=flat-square
[docker-image]: https://img.shields.io/docker/pulls/sitespeedio/browsertime.svg?style=flat-square
[docker-url]: https://hub.docker.com/r/sitespeedio/browsertime
[license-image]: https://img.shields.io/npm/l/browsertime.svg?style=flat-square
[license-url]: https://github.com/sitespeedio/browsertime/blob/main/LICENSE
[stars-image]: https://img.shields.io/github/stars/sitespeedio/browsertime.svg?style=flat-square
[stars-url]: https://github.com/sitespeedio/browsertime/stargazers
