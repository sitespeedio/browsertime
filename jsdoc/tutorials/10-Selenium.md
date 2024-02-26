You can use Selenium directly if you need to use things that are not available through our commands. We use the NodeJS flavor of Selenium.

You get a hold of the Selenium objects through the context object.

The *selenium.webdriver* is the Selenium [WebDriver public API object](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html). And *selenium.driver* is the [instantiated version of the WebDriver](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html) driving the current version of the browser.

Checkout this example to see how you can use them.

```JavaScript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // We fetch the selenium webdriver from context
  // The selenium-webdriver 
  // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index.html
  const seleniumWebdriver = context.selenium.webdriver;
  // The driver exposes for example By that you use to find elements
  const By = seleniumWebdriver.By;

  // We use the driver to find an element
  const seleniumDriver = context.selenium.driver;

  // To navigate to a new page it is best to use our navigation commands
  // so the script waits until the page is loaded
  await commands.navigate('https://www.sitespeed.io');

  // Lets use Selenium to find the Documentation link
  const seleniumElement = await seleniumDriver.findElement(By.linkText('Documentation'));
  
  // So now we actually got a Selenium WebElement 
  // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElement.html
  context.log.info('The element tag is ', await seleniumElement.getTagName());

  // We then use our command to start a measurement
  await commands.measure.start('DocumentationPage');

  // Use the Selenium WebElement and click on it
  await seleniumElement.click();
  // We make sure to wait for the new page to load
  await commands.wait.byPageToComplete();

  // Stop the measuerment
  return commands.measure.stop();
}
```

If you need help with Selenium, checkout [the official Selenium documentation](https://www.selenium.dev/documentation/).
