/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var async = require('async'),
    path = require('path'),
    url = require('url'),
    logger = require('../logger');

    function BrowserListenerProxy(browsertime, proxy, options) {
    this.browsertime = browsertime;
    this.proxy = proxy;
    this.log = logger.getLog();
    this.harFile = options.harFile || path.join(process.cwd(), url.parse(options.url).hostname + '.har');
}

BrowserListenerProxy.prototype.setupListeners = function () {
    var p = this.proxy;
    var harFile = this.harFile;
    var pageCount = 0;
    var self = this;

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
            self.log.info('Storing ' + harFile);
            p.saveHar(harFile, data.data, cb);
        });
};

module.exports.setup = function(browsertime, proxy, options) {
    var blp = new BrowserListenerProxy(browsertime, proxy, options);
    blp.setupListeners();
};
