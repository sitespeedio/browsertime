## Error

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