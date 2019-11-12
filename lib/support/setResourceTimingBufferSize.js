'use strict';

module.exports = async function(driver, size) {
  await driver.get('data:text/html;charset=utf-8,<html><body></body></html>');
  await driver.executeScript(
    `window.performance.setResourceTimingBufferSize(${size});`
  );
};
