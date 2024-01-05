## Error handling
You can try/catch failing commands that throw errors. If an error is not caught in your script, it will be caught in sitespeed.io and the error will be logged and reported in the HTML and to your data storage (Graphite/InfluxDb) under the key *browsertime.statistics.errors*.

If you do catch the error, you should make sure you report it yourself with the [error command](Error.html), so you can see that in the HTML. This is needed for all errors except navigating/measuring a URL. They will automatically be reported (since they are always important).

Here's an example of catching a URL that don't work and still continue to test another one. Remember since a navigation fails, this will be reported automatically and you don't need to do anything.

```JavaScript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  try {
    await commands.measure.start('https://nonworking.url/');
  } catch (e) {}
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
```

You can also create your own errors. The error will be reported in the HTML and sent to Graphite/InfluxDB. If you report an error, the exit code from sitespeed.io will be > 0.

```JavaScript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // ...
  try {
    // Click on a link
    await commands.click.byLinkTextAndWait('Checkout');
  } catch (e) {
    // Oh no, the content team has changed the name of the link!
     commands.error('The link named Checkout do not exist on the page');
    // Since the error is reported, you can alert on it in Grafana
  }
};
```

## Failure

## Screenshot

Take a screenshot. The image is stored in the screenshot directory for the URL you are testing. This can be super helpful to use in a catch block if something fails. If you use sitespeed.io you can find the image in the screenshot tab for each individual run.

![Screenshots](https://www.sitespeed.io/img/multiple-screenshots.jpg)


```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  
  await commands.screenshot.take('ScreenshotName');
 }
```