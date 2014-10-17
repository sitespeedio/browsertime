/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var webdriver = require('selenium-webdriver'),
  firefox = require('selenium-webdriver/firefox'),
  proxy = require('selenium-webdriver/proxy');

exports.getDriver = function(arg) {

  var options = new firefox.Options();
  var profile = new firefox.Profile();

  if (arg.size) {
    var binary = new firefox.Binary();
    var size = arg.size.split('x');
    binary.addArguments(['-width', size[0], '-height', size[1]]);
    options.setBinary(binary);
  }

  if (arg.userAgent) {
    profile.setPreference('general.useragent.override', arg.userAgent);
  }

  // try to remove the caching between runs
  profile.setPreference('browser.cache.disk.enable', false);
  profile.setPreference('browser.cache.memory.enable', false);
  profile.setPreference('browser.cache.offline.enable', false);
  profile.setPreference('network.http.use-cache', false);
  profile.setPreference('dom.enable_resource_timing', true);

  options.setProfile(profile);

  if (arg.proxy) {
    return new webdriver.Builder().
    withCapabilities(options.toCapabilities().setProxy(proxy.manual({
      http: arg.proxy
    }))).build();
  } else {
    return new webdriver.Builder().
    withCapabilities(options.toCapabilities()).build();
  }
};