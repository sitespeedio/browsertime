var MobProxy = require('./mobproxy'),
    path = require('path'),
    url = require('url');

const nullProxy = {
    start: function(cb) { cb(); },
    stop: function(cb) { cb(); },
    clearDNS: function(cb) { cb(); },
    newPage: function(name, cb) { cb(); },
    supportsHar: function() {
        console.log("Not supporting HAR files");
        return false; },
    saveHar: function(filename, data, cb) { cb(); },
    getProxyUrl: undefined
};

var createProxy = function(options) {
    if (!options.useProxy || options.useProxy !== 'true') {
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
        proxySleepBeforeStart: options.proxySleepBeforeStart
    });
};

function setupMobProxyDefaults(options) {
     options.harFile = options.harFile || path.join(process.cwd(), url.parse(options.url).hostname + '.har');
     options.proxySleepBeforeStart = options.proxySleepBeforeStart || 3000;

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

module.exports.createProxy = createProxy;