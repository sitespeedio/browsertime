'use strict';

module.exports = function setResourceTiming(context) {
  // start(runner, testUrl, options, data, index) {
  return context.runWithDriver(driver => {
    // start on a blank page and lets make the background orange
    // that will make it easier for VisualMetrics to know when the
    // page is requested
    return (
      driver
        .get('data:text/html;charset=utf-8,')
        // increase the default resource timing buffer size, in the future we
        // we should have a separate setup step.
        .then(() =>
          driver.executeScript(
            'window.performance.setResourceTimingBufferSize(600);'
          )
        )
    );
  });
};
