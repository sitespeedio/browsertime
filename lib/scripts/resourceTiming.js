/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var resources = function() {
  // TODO fetch from iframes?
  if (typeof window.performance == 'object') {
    if (typeof window.performance.getEntriesByType == 'function') {
      return {
        resources: window.performance.getEntriesByType('resource'),
      };
    }
  }
  return {
    resources: []
  };
};

module.exports = resources;
