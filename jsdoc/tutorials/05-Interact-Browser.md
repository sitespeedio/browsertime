
## Navigate

You can navigate to a URL without measuring it. You do it with the [navigate function](Commands.html#navigate). Navigation will use the same logic as measuring, it will wait for the page complete check to finish.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate('https://www.sitespeed.io');
}
```



## Cache
You can clear the browser cache from your script. The command works in Chrome and Edge. Use it when you want to clear the browser cache between different URLs.

### Clear cache and cookies

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // First you probably visit a couple of pages and then clear the cache
  await commands.cache.clear();
  // And then visit another page
}
```

### Clear cache but keep cookies

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // If you have login cookies that lives really long you may want to test accesing the page as a logged in user
  // but without a browser cache. You can try that with ...

  // Login the user and the clear the cache but keep cookies
  await commands.cache.clearKeepCookies();
  // and then access the URL you wanna test.
}
```

### Navigation
You can use the [Navigation command](Navigation.html) to go back, forward or refresh the page in the browser.


