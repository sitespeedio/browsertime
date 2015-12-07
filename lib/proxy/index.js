/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var MobProxy = require('./mobproxy'),
    url = require('url');

var nullProxy = {
    launchProcess: function(cb) { cb(); },
    stopProcess: function(cb) { cb(); },
    openProxy: function(cb) { cb(); },
    closeProxy: function(cb) { cb(); },
    clearDNS: function(cb) { cb(); },
    newPage: function(name, cb) { cb(); },
    saveHar: function(filename, data, cb) { cb(); },
    getProxyUrl: function() { return undefined; }
};

var namedConnectionProfiles = {
  'mobile3g': {
    downstreamKbps: 1600,
    upstreamKbps: 768,
    latency: 300
  },
  'mobile3gfast': {
    downstreamKbps: 1600,
    upstreamKbps: 768,
    latency: 150
  },
  'mobile3gslow': {
    downstreamKbps: 780,
    upstreamKbps: 330,
    latency: 200
  },
  'mobile2g': {
    downstreamKbps: 35,
    upstreamKbps: 32,
    latency: 1300
  },
  'cable': {
    downstreamKbps: 5000,
    upstreamKbps: 1000,
    latency: 28
  }
};

function setupMobProxyDefaults(options) {
    options.proxySleepBeforeStart = options.proxySleepBeforeStart || 15000;

    // proxy port is set up when proxy is just about to launch
    options.proxy = 'localhost:' + options.mobProxyPort;

    if (!options.connectionRaw) {
      options.connectionRaw = namedConnectionProfiles[options.connection];
    }
}

var createProxy = function(options) {
  if (options.noProxy) {
    return nullProxy;
  }

  setupMobProxyDefaults(options);

  return new MobProxy({
    port: options.mobProxyPort,
    proxyPort: options.proxyPort,
    domain: url.parse(options.url).hostname,
    headers: options.headers,
    basicAuth: options.basicAuth,
    limit: options.connectionRaw,
    blacklist: options.blacklist,
    blacklistStatus: options.blacklistStatus,
    blacklistMethod: options.blacklistMethod,
    proxySleepBeforeStart: options.proxySleepBeforeStart,
    logDir: options.logDir,
    silent: options.silent
  });
};

module.exports.createProxy = createProxy;
