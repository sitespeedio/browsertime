/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var chrome = require('./chrome'),
    firefox = require('./firefox'),
    safari = require('./safari'),
    phantomjs = require('./phantomjs'),
    ie = require('./ie');

var browsers = {
    'chrome': chrome,
    'firefox': firefox,
    'safari': safari,
    'phantomjs': phantomjs,
    'ie': ie
};

var proxy;

module.exports.setProxy = function(p) {
    proxy = p;
};

module.exports.getBrowser = function(browserId) {
    var browser = browsers[browserId];

    if (!browser) {
        throw 'Unsupported browser: ' + browserId;
    }

    browser.setProxy(proxy);

    return browser;
};
