(function() {
  /**
   * Browsertime (http://www.browsertime.com)
   * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
   * and other contributors
   * Released under the Apache 2.0 License
   */

// someway the get entries by type isn't working in IE using Selenium,
// will spend time fixing this later, now just return empty
  if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
    return [];
  }

  if (window.performance && window.performance.getEntriesByType) {
    var timings = window.performance.getEntriesByType('resource');
    // workaround for issue with Firefox where each resource timing entry contains a toJSON entry.
    return JSON.parse(JSON.stringify(timings));
  } else {
    return [];
  }
})();
