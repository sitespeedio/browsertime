'use strict';

module.exports = async function(driver) {
  await driver.get('data:text/html;charset=utf-8,');
  await driver.executeScript(
    'window.performance.setResourceTimingBufferSize(600);'
  );
};
