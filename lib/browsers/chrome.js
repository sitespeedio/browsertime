/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var webdriver = require('selenium-webdriver'),
  chrome = require('selenium-webdriver/chrome');

exports.getDriver = function(arg) {
  var options = new chrome.Options();

  if (arg.userAgent) {
    options.addArguments('--user-agent=' + arg.userAgent);
  }

  if (arg.size) {
    var size = arg.size.replace('x', ',');
    options.addArguments('--window-size=' + size);
  }

  options.addArguments('--window-position=0,0');

  /* TODO add proxy when needed
var driver = new webdriver.Builder().
withCapabilities(options.toCapabilities().setProxy(proxy.manual({
  http: 'localhost:8888'
}))).build();
*/

  return new webdriver.Builder().
  withCapabilities(options.toCapabilities()).build();
};