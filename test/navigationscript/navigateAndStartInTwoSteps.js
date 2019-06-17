module.exports = async function(context, commands) {
  await commands.navigate('https://www.sitespeed.io');
  // we fetch the selenium webdriver from context
  const webdriver = context.selenium.webdriver;
  const driver = context.selenium.driver;
  // and get hold of some goodies we want to use
  const until = webdriver.until;
  const By = webdriver.By;

  const docLink = driver.findElement(By.linkText('Documentation'));
  // before you start, make your username and password
  await commands.measure.start();
  // Before we click on the link, start the measurement
  docLink.click();
  await driver.wait(until.elementLocated(By.linkText('Chrome-HAR')), 6000);
  return commands.measure.stop();
};
