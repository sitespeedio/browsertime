### Simple Script Example

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