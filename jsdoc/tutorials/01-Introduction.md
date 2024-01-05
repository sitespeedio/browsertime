Scripting in sitespeed.io and Browsertime allows you to measure user journeys by interacting with web pages. This feature is essential for simulating real-user interactions and collecting performance metrics for complex workflows. It's important to note that scripting works the same in both Browsertime and sitespeed.io.

## Simple script
Here's a basic script example to start with:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  return commands.measure.start('https://www.sitespeed.io');
}
```

To run this script, use the command `sitespeed.io -n 1 --multi measure.mjs`. This script measures the performance of https://www.sitespeed.io.

You can see that you get two helper objects in that function. The browsertime context and browsertime commands. Lets talk about those helper objects.

## Helpers
Lets start with the command object.

### The Commands Object

Commands are helpers for interacting with webpages. Key commands include:

- `navigate(URL)`: Navigates to a URL without automatic measurement.
- `measure.start(URL)`: Starts measuring and navigates to a URL.
- `measure.stop()`: Stops the measurement and collects metrics.

You can see all commands in the Classes part of the documentation. 

### The Context Object

The `context` object in your script gives you access to:

- `options`: All options sent from the CLI to Browsertime.
- `log`: An instance of the log system.
- `index`: The index of the current run.
- `storageManager`: Helps in reading/storing files to disk.
- `selenium.webdriver`: The public API object of Selenium WebDriver.
- `selenium.driver`: The instantiated WebDriver for the current browser session.

## Asynchronous commands
Many Browsertime commands are asynchronous, returning promises.

Use await to ensure the script waits for an action to complete. When using multiple async operations, return the last promise to ensure the script waits until all operations are complete.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  return commands.measure.start('https://www.sitespeed.io');
}
```