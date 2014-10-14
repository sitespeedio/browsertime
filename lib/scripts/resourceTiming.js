/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var resources = function() {
  // TODO fetch from iframes && find a way to check that the resource api is supported
      return {
        resources: window.performance.getEntriesByType('resource'),
      };
};

module.exports = resources;
