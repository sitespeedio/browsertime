var MobProxy = require('./mobproxy'),
    winston = require('winston'),
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

function setupMobProxyDefaults(options) {
    options.proxySleepBeforeStart = options.proxySleepBeforeStart || 15000;

    options.mobProxyPort = options.mobProxyPort ||  9091;
    options.proxyPort = options.proxyPort ||  9092;
    options.proxy = 'localhost:' + options.mobProxyPort;

    if (options.connection) {
        if (options.connection === 'mobile3g') {
            options.connectionRaw = {
                downstreamKbps: 1600,
                upstreamKbps: 768,
                latency: 300
            };
        } else if (options.connection === 'mobile3gfast') {
            options.connectionRaw = {
                downstreamKbps: 1600,
                upstreamKbps: 768,
                latency: 150
            };
        } else if (options.connection === 'cable') {
            options.connectionRaw = {
                downstreamKbps: 5000,
                upstreamKbps: 1000,
                latency: 28
            };
        }
    }
}

var createProxy = function(options) {
    var useProxy = options.useProxy;
    setupLogs(options);

    if (useProxy && typeof useProxy === 'string' && useProxy !== 'true') {
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
        proxySleepBeforeStart: options.proxySleepBeforeStart,
        logDir: options.logDir,
        silent: options.silent
    });
};

function setupLogs(options) {
  winston.loggers.add('browsermobproxy', {
    file: {
      level: 'info',
      json: 'false',
      label: 'browsermobproxy',
      filename: options.logDir?path.join(options.logDir,'browsermobproxy.log'):'browsermobproxy.log'
    },
    console: {
      silent: true
    }
  });

  winston.loggers.add('browsertime', {
    file: {
      level: 'info',
      json: 'false',
      label: 'browsertime',
      filename: options.logDir?path.join(options.logDir,'browsertime.log'):'browsertime.log'
    },
    console: {
      silent: (options.silent === 'true')? true : false
    }
  });

};

module.exports.createProxy = createProxy;
