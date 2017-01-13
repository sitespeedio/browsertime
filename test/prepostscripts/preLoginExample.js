'use strict';
/*
  Here's an example of how you can use a preTask to login the user
  and then measure/get metrics from pages as an authenticated user
  */

module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      // Go to Wikipedias login URL
      return driver.get('https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page')
        .then(() => {
          // You need to find the form, the login input fields and the
          // password field. Just add you name and password and submit the form
          // For more docs, checkout the NodeJS Selenium version
          // http://selenium.googlecode.com/git/docs/api/javascript/index.html

          // we fetch the selenium webdriver from context
          var webdriver = context.webdriver;
          // before you start, make your username and password
          var userName = 'YOUR_USERNAME_HERE';
          var password = 'YOUR_PASSWORD_HERE';
          var loginForm = driver.findElement(webdriver.By.css('form'));
          var loginInput = driver.findElement(webdriver.By.id('wpName1'));
          loginInput.sendKeys(userName);
          var passwordInput = driver.findElement(webdriver.By.id('wpPassword1'));
          passwordInput.sendKeys(password);
          return loginForm.submit();
          // this example skips waiting for the next page and validating that the login was successful.
        });
    })
  }
};
