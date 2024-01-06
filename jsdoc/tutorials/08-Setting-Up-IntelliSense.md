IntelliSense in Visual Studio Code can significantly enhance your scripting experience with Browsertime by providing code completions, parameter info, quick info, and member lists. Here's how to set it up:

### Install Browsertime

First, ensure that the Browsertime types are installed in your project. If they're not included by default, you can install them via npm:

```bash
   npm install browsertime --save-dev
```

### Reload Visual Studio Code
After these changes, reload Visual Studio Code to ensure that the settings are applied.

### Write Your Script
Now, when you write your Browsertime script, IntelliSense should automatically suggest relevant Browsertime methods and properties when you add the param comments as in this example.

```JavaScript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) { 

};
```