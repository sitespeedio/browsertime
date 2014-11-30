var async = require('async'),
    path = require('path'),
    log = require('winston'),
    url = require('url');

function BrowserListenerProxy(browsertime, proxy, options) {
    this.browsertime = browsertime;
    this.proxy = proxy;

    this.harFile = options.harFile || path.join(process.cwd(), url.parse(options.url).hostname + '.har');
}

BrowserListenerProxy.prototype.setupListeners = function () {
    var p = this.proxy;
    var harFile = this.harFile;
    var pageCount = 0;

    this.browsertime
        .on('beforeRun', function (cb) {
            pageCount = 0;
            p.openProxy(cb);
        })
        .on('afterRun', function (cb) {
            p.closeProxy(cb);
        })
        .on('callingBrowser', function (callback) {
            async.series([
                    function (cb) {
                        pageCount++;
                        if (pageCount > 1) {
                            //First page is implicitly opened in openProxy
                            p.newPage('myname', cb);
                        } else {
                            cb();
                        }
                    },
                    function (cb) {
                        p.clearDNS(cb);
                    }
                ],
                callback);
        })
        .on('savingResults', function (data, cb) {
            log.info('Storing ' + harFile);
            p.saveHar(harFile, data.data, cb);
        });
};

module.exports.setup = function(browsertime, proxy, options) {
    var blp = new BrowserListenerProxy(browsertime, proxy, options);
    blp.setupListeners();
};
