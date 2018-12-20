module.exports = async function(context) {
  await context.h.navigate('https://www.sitespeed.io');
  // we fetch the selenium webdriver from context
  const webdriver = context.webdriver;
  const driver = context.driver;
  // and get hold of some goodies we want to use
  const until = webdriver.until;
  const By = webdriver.By;
  // before you start, make your username and password
  await context.h.startMeasure('https://www.sitespeed.io');
  const docLink = driver.findElement(By.linkText('Documentation'));
  // Before we click on the link, start the measurement
  docLink.click();
  await driver.wait(until.elementLocated(By.linkText('Chrome-HAR')), 6000);
  return context.h.collect();
};
