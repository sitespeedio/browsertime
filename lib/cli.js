var validBrowsers = ['chrome', 'firefox', 'ie', 'phantomjs'];
var validConnectionSpeed = ['mobile3g', 'mobile3gfast', 'cable', 'native'];

function help() {
  console.log(' -u the URL to test');
  console.log(
    ' -f Output the result as a file, give the name of the file. If no filename is given, the name will be the domain of the url'
  );
  console.log(' --harFile the HAR file name. If no filename, the name will be $domain.har');
  console.log(' -b The browser to use. Supported values are:' + validBrowsers +
    ', default being chrome. To use PhantomJS, you need the coming 2.0 release.');
  console.log(' -n the number of times to run the test, default being 3');
  console.log(
    ' --userAgent Set the user agent. Default is the one by the browser you use. Only works with Chrome and Firefox');
  console.log(' -w The size of the browser window: <width>x<height>, e.g. 400x600. Only works with Chrome and Firefox');
  console.log(' --scriptPath the path to an extra script folder. ');
  console.log(' --headers set request headers by setting a JSON of the format {name:value,name2:value2}');
  console.log(' --basicAuth {username:$NAME, password:$password}');
  console.log(' --useProxy use MobProxy or not. Use it to get a HAR file.');
  console.log(
    ' --connection the speed by simulating connection types, one of [' + validConnectionSpeed + '], default is native');
  console.log(
    ' --connectionRaw the speed by simulating connection types by setting a JSON like {downstreamKbps: $X, upstreamKbps: $Y, latency: $Z}'
  );
  console.log(' --silent only output info in the logs, not stdout');
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