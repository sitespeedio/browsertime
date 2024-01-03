# Scripting
Here are the documenation for using scriping commands.

To get code completion/intellisense in Visual Studio code, add Browsertime as a developer dependency `npm install browsertime --save-dev`

And then create your script files and pointing out the cotrrect context/commands object.

```
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) { 

};
```