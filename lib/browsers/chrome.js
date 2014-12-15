/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var webdriver = require('selenium-webdriver'),
  chrome = require('selenium-webdriver/chrome'),
  proxy = require('selenium-webdriver/proxy');

var externalProxy;

module.exports.setProxy = function(p) {
  externalProxy = p;
};

module.exports.getDriver = function(arg) {
  var options = new chrome.Options();

  if (arg.userAgent) {
    options.addArguments('--user-agent=' + arg.userAgent);
  }

  var cap = options.toCapabilities();

  var proxyUrl = externalProxy.getProxyUrl();
  if (proxyUrl) {
      cap.setProxy(proxy.manual({ http: proxyUrl }));
  }

  return new webdriver.Builder().withCapabilities(cap).build();
};