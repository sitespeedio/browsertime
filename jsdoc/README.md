# Scripting
Here are the JSDoc for using scripting commands that you use to measure user journeys in Browsertime/sitespeed.io. You can find the full documentation [here](https://www.sitespeed.io/documentation/sitespeed.io/scripting/).

To get code completion/IntelliSense in Visual Studio code, add Browsertime as a developer dependency `npm install browsertime --save-dev` to your project.

And then create your script files and pointing out the correct context/commands object.

```
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) { 

};
```