'use strict';

let yargs = require('yargs'),
  urlValidator = require('valid-url'),
  util = require('util'),
  packageInfo = require('../../package');

function validateInput(argv) {
  let url = argv._[0];
  if (!urlValidator.isWebUri(url)) {
    return util.format('\'%s\' is not a valid url (e.g. http://www.browsertime.net)', url);
  }
  return true;
}

module.exports.parseCommandLine = function parseCommandLine() {
  let argv = yargs
    .usage('$0 [options] <url>')
    .require(1, 'url')
    .version(function() {
      return packageInfo.version;
    })
    .count('verbose')
    .string('o')
    .string('b')
    .default('delay', 0)
    .default('timeouts.pageLoad', 10000)
    .default('timeouts.script', 5000)
    .default('timeouts.pageCompleteCheck', 10000)
    .default('output', 'bt.json')
    .default('har', 'bt.har')
    .default('iterations', 3)
    .string('userAgent')
    .string('seleniumUrl')
    .string('_')
    .boolean('silent')
    .boolean('seleniumServer')
    .help('h')
    .alias('h', 'help')
    .config('config')
    .alias('V', 'version')
    .alias('v', 'verbose')
    .alias('b', 'browser')
    .alias('n', 'iterations')
    .alias('o', 'output')
    .alias('q', 'silent')
    .describe('delay', 'Delay between runs, in milliseconds')
    .describe('browser', 'Specify browser')
    .describe('userAgent', 'Override user agent')
    .describe('silent', 'Only output info in the logs, not to the console')
    .describe('output', 'Specify output file for Browsertime data')
    .describe('har', 'Specify output file for HAR data')
    .describe('seleniumServer', 'Use SeleniumServer jar file to interact with browser.')
    .describe('seleniumUrl', 'URL to a running Selenium server (e.g. to run a browser on another machine).')
    .describe('config', 'Path to json config file')
    .describe('timeouts.pageLoad', 'Timeout when waiting for url to load, in milliseconds')
    .describe('timeouts.script', 'Timeout when running browser scripts, in milliseconds')
    .describe('timeouts.pageCompleteCheck', 'Timeout when waiting for page to complete loading, in milliseconds')
    .choices('browser', ['chrome', 'firefox', 'ie'])
    .check(validateInput)
    .argv;

  return {
    'url': argv._[0],
    'options': argv
  };
};
