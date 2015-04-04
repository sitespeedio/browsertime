/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var validUrl = require('valid-url');

var validBrowsers = ['chrome', 'firefox', 'ie', 'safari', 'phantomjs'];
var validConnectionSpeed = ['mobile3g', 'mobile3gfast', 'cable', 'native'];

function help() {
  console.log(' -u, --url the URL to test');
  console.log(
    ' -f, --filename Output the result as a file, give the name of the file. If no filename is given, the name will be the domain of the url.'
  );
  console.log(' --harFile the HAR file name. If no filename, the name will be <domain>.har.');
  console.log(' -b, --browser The browser to use. Supported values are:' + validBrowsers +
    ', default being Chrome. To use PhantomJS, you need the coming 2.0 release. Note: Safari will not generate a HAR file.'
  );
  console.log(' -n, --runs the number of times to run the test, default being 3.');
  console.log(
    ' --userAgent Set the user agent. Default is the one by the browser you use. Only works with Chrome and Firefox.');
  console.log(' -w, --size The size of the browser window: <width>x<height>, e.g. 400x600. Only works with Chrome and Firefox.');
  console.log(' --customScripts the path to an extra script folder.');
  console.log(' --headers set request headers by setting a JSON of the format {name:value,name2:value2}.');
  console.log(' --basicAuth username:password');
  console.log(' --useProxy use MobProxy or not. Use it to get a HAR file.');
  console.log(
    ' --connection the speed by simulating connection types, one of [' + validConnectionSpeed + '], default is native.');
  console.log(
    ' --connectionRaw the speed by simulating connection types by setting a JSON like {downstreamKbps: $X, upstreamKbps: $Y, latency: $Z}.'
  );
  console.log(' --seleniumServer configure the path to the Selenium server. A default server runs on http://localhost:4444/wd/hub. If not configured the supplied NodeJS/Selenium version is used.');
  console.log(' --silent only output info in the logs, not stdout.');
  console.log(' -v, --verbose enable verbose logging.');
  console.log(' --noColor don\'t use colors in console output.');
  console.log(' --waitScript supply a javascript that decides when a run is finished (return true)');
  console.log(' --logDir absolute path to the directory where the logs will be. default is current dir.');
  console.log(' -V, --version show version number of browsertime.');
  console.log(' -h, --help show this help message.');
}

exports.verifyInput = function verifyInput(options) {
  if (options.help) {
    help();
    process.exit(0);
  }

  if (options.version) {
    console.log(require('../package.json').version);
    process.exit(0);
  }

  if (!options.url) {
    console.error('Missing url');
    help();
    process.exit(255);
  }

  if (!validUrl.isWebUri(options.url)) {
    console.error('--url: \'' + options.url + '\' is not a complete url, you need to start with http:// or https://.');
    process.exit(255);
  }

  if (!options.browser) {
    options.browser = 'chrome';
  } else if (validBrowsers.indexOf(options.browser) < 0) {
    console.error('\'' + options.browser + '\' isn\'t a supported browser.');
    help();
    process.exit(255);
  }
};
