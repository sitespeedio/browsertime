Debugging is crucial for script development. Here are some tips:

- Use `--debug` mode to add breakpoints.
- Utilize `context.log` for logging within your script.
- Run scripts locally for easier debugging.
- In Docker environments, use `--browsertime.videoParams.debug` to record a full video of your script for analysis.
- Implement `try/catch` blocks and `await` promises for robust error handling.

### Use debug with breakpoints

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
  await commands.breakpoint('');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
```