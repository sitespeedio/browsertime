There are a couple of ways of debugging your scripts.

## Use the log
The easist way know what's going on is log to the browsertime/sitespeed.io log. You can do that with log object that exist in the context object.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  context.log.info('Logging at the info level');
  context.log.error('Oh no it is an error!');
 }
```

## Use debug with breakpoints

You can use breakpoints to debug your script. You can add breakpoints to your script that will be used when you run in `--debug` mode. At each breakpoint the browser will pause. You can continue by adding window.browsertime.pause=false; in your developer console.

Debug mode works in Chrome/Firefox/Edge when running on desktop. It do not work in Docker and on mobile. When you run in debug mode, devtools will be automatically open so you can debug your script.

In debug mode, the browser will pause after each iteration.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  await commands.debug.breakpoint('');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
```

## Watch what's going on
If your script stopped working in your monitoring, try to run the test locally where you can watch the browser window.

Either you can do it with Docker following these [instructions](https://www.sitespeed.io/documentation/sitespeed.io/docker/#visualise-your-test-in-xvfb)  or run your test with a locally installed sitespeed.io using `npm install sitespeed.io -g`.


## Better safe than sorry
Implement `try/catch` blocks for robust error handling.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  try {
    // do something that can break
  } catch(error) {
    context.log.error('Oh no it is an error!', error);
    // You can also take a screenshot of the error
    await commands.screenshot.take('myError');
  }
 }
```

If you measure a navigation by clicking on an element and the element do 
not exists or somnething goes wrong, you can stop the measuerement and make sure 
no metrics is collected.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  
  await commands.measure.start('my_trip');
  try {
    // do something that can break
    await commands.mouse.singleClick.byLinkTextAndWait('Next page');
    await commands.measure.stop();
  } catch(error) {
    await commands.measure.stopAsError('Could not click the next page link');
  }
 }
```