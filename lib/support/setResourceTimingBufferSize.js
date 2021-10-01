'use strict';

module.exports = async function (startURL, driver, size) {
  await driver.get(startURL);
  await driver.executeScript(
    `window.performance.setResourceTimingBufferSize(${size});`
  );
};
