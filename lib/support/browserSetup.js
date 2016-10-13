'use strict';

module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      return driver.get('data:text/html;charset=utf-8,')
        .then(() => driver.executeScript(' window.performance.setResourceTimingBufferSize(1000);'))
        });
  }
};
