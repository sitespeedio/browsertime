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
    return {
      measures: [],
      marks: []
    };
  } else {
    var marks = [],
      measures = [];

    if (window.performance && window.performance.getEntriesByType) {
      // workaround for issue with Firefox where each user timing entry contains a toJSON entry.
      marks = JSON.parse(JSON.stringify(window.performance.getEntriesByType('mark')));
      measures = JSON.parse(JSON.stringify(window.performance.getEntriesByType('measure')));
    }

    return {
      marks : marks,
      measures: measures
    };
  }
})();
