Send messages to the browser using the [BiDirectional WebDriver Protocol (Bidi)](https://w3c.github.io/webdriver-bidi/). This works in Firefox today and later more browsers. You can send, send and get and listen on events. This is a super powerful feature that enables you to do a lot.

There's no user friendly documentation right now for Bidi.

### Sending a command

Here’s an example of sending a command that injects JavaScript that runs on every new document.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  const params = {
  method: 'script.addPreloadScript',
  params: {
    functionDeclaration: "function() {alert('hello');}"
   }
  };
  await commands.bidi.send(params);
  await commands.measure.start('https://www.sitespeed.io');
}
```

### Subscribe and unsubscribe to events

You need to subscribe to the event types that you are interested in with `commands.bidi.subscribe('messageType');` and unsubscribe when you are done. 

### Listen on events

When you subscribe on an event you want to do something when the events happen.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // We want to to do something on all the requests that are sent
  await commands.bidi.subscribe('network.beforeRequestSent');

  await commands.bidi.onMessage(function (event) {
    const myEvent = JSON.parse(Buffer.from(event.toString()));
    console.log(myEvent);
  });

  await commands.navigate('https://www.sitespeed.io');
}
```