module.exports = {
  run(context, help) {
    return context.runWithDriver(async function(driver) {
      await help.navigate('https://www.sitespeed.io');
      // we fetch the selenium webdriver from context
      const webdriver = context.webdriver;
      // and get hold of some goodies we want to use
      const until = webdriver.until;
      const By = webdriver.By;
      // before you start, make your username and password
      await help.start();
      const docLink = driver.findElement(By.linkText('Documentation'));
      // Before we click on the link, start the measurement
      docLink.click();
      return driver.wait(until.elementLocated(By.linkText('Chrome-HAR')), 6000);
    });
  }
};
