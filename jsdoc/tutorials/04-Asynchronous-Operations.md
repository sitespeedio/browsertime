Many Browsertime commands are asynchronous, returning promises. Here's how to handle them:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate('https://www.sitespeed.io');
  // More asynchronous operations
}
```

Use await to ensure the script waits for an action to complete. When using multiple async operations, return the last promise to ensure the script waits until all operations are complete.

