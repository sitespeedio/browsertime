var validBrowsers = ['chrome', 'firefox', 'phantomjs'];

function help() {
  console.log(' -u the URL to test');
  console.log(' -f base file name');
  console.log(' -b the browser to use, use one of the following:' + validBrowsers);
  console.log(' -n the number of runs [3]');
  console.log(' --userAgent the user agent String');
  console.log(' -w the screensize wXh');
  console.log(' --scriptPath the path to an alternative script folder');
  console.log(' --headers request headers {name:value,name2:value2}');
  console.log(' --basicAuth {username:$NAME, password:$password}');
  console.log(' --useProxy use MobProxy or not');
  console.log(' --limit the speed: {downstreamKbps: $X, upstreamKbps: $Y, latency: $Z}');
}

exports.verifyInput = function verifyInput(options) {
  if (options.help) {
    help();
    process.exit(0);
  }

  if (!options.url) {
    console.error('Missing url');
    help();
    process.exit(255);
  }
  if (!options.browser) {
    options.browser = 'chrome';
  } else if (validBrowsers.indexOf(options.browser) < 0) {
    console.error('Browsertime dont support ' + options.browser);
    help();
    process.exit(255);
  }
};