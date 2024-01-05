Here are some tips and tricks that can make your scripting better.

### Include the script in the HTML result
If you wanna keep of what script you are running, you can include the script into the HTML result with ```--html.showScript```. You will then get a link to a page that show the script.

![Page to page](https://www.sitespeed.io/img/script-link.png)

### Getting correct Visual Metrics
Visual metrics is the metrics that are collected using the video recording of the screen. In most cases that will work just out of the box. One thing to know is that when you go from one page to another page, the browser keeps the layout of the old page. That means that your video will start with the first page (instead of white) when you navigate to the next page.

It will look like this:
![Page to page](https://www.sitespeed.io/img/filmstrip-multiple-pages.jpg)

This is perfectly fine in most cases. But if you want to start white (the metrics somehow isn't correct) or if you click a link and that click changes the layout and is caught as First Visual Change, there are workarounds.

If you just want to start white and navigate to the next page you can just clear the HTML between pages:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    // Renove the HTML and make sure the background is white
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    return commands.measure.start('https://www.sitespeed.io/examples/');
};
```

If you want to click a link and want to make sure that the HTML doesn't change when you click the link, you can try to hide the HTML and then click the link.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    // Hide everything
    // We do not hide the body since the body needs to be visible when we do the magic to find the staret of the
    // navigation by adding a layer of orange on top of the page
    await commands.js.run('for (let node of document.body.childNodes) { if (node.style) node.style.display = "none";}');
    // Start measurning
    await commands.measure.start();
    // Click on the link and wait on navigation to happen
    await commands.click.bySelectorAndWait('body > nav > div > div > div > ul > li:nth-child(2) > a');
    return commands.measure.stop();
};
```

### Pass your own options to your script
You can add your own parameters to the options object (by adding a parameter) and then pick them up in the script. The scripts runs in the context of browsertime, so you need to pass it in via that context.

For example: you wanna pass on a password to your script, you can do that by adding <code>--browsertime.my.password MY_PASSWORD</code> and then in your code get a hold of that with:

```JavaScript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // We are in browsertime context so you can skip that from your options object
  context.log.info(context.options.my.password);
};
```

If you use a configuration file you can pass on options like this:

```json
{
    "browsertime": {
        "my": {
            "password": "paAssW0rd"
        }
    }
}
```

### Getting values from your page
In some scenarios you want to do different things dependent on what shows on your page. For example: You are testing a shop checkout and you need to verify that the item is in stock. You can run JavaScript and get the value back to your script.

Here's an simple example, IRL you will need to get something from the page:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // We are in browsertime context so you can skip that from your options object
  const secretValue = await commands.js.run('return 12');
  // if secretValue === 12 ...
}
```

If you want to have different flows depending on a element exists you can do something like this:

```javascript
...
const exists = await commands.js.run('return (document.getElementById("nonExistsingID") != null) ');
if (exists) {
    // The element with that id exists
} else {
    // There's no element with that id
}
```

### Test one page that need a much longer page complete check than others

If you have one page that needs some special handling that maybe do a couple of late and really slow AJAX requests, you can catch that with your on wait for the page to finish.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // First test a couple pages with default page complete check
  await commands.measure.start('https://<page1>');
  await commands.measure.start('https://<page2>');
  await commands.measure.start('https://<page3>');

  // Then we have a page that we know need to wait longer, start measuring
  await command.measure.start('MySpecialPage');
  // Go to the page
  await commands.navigate('https://<myspecialpage>');
  // Then you need to wait on a specific element or event. In this case
  // we wait for a id to appear but you could also run your custom JS
  await commands.wait.byId('my-id', 20000);
  // And then when you know that page has loaded stop the measurement
  // = stop the video, collect metrics etc
  return commands.measure.stop();
};
```


### Test the same page multiple times within the same run

If you for some reason want to test the same URL within the same run multiple times, it will not work out of the box since the current version create the result files using the URL. For example testing https://www.sitespeed.io/ two times, will break since the second access will try to overwrite the first one.

But there is a hack you can do. If you add a dummy query parameter (and give the page an alias) you can test them twice.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io/', 'HomePage');

    // Do something smart that then make you need to test the same URL again
    // ...

    return commands.navigate('https://www.sitespeed.io/?dummy', 'BackToHomepage');
};
```

### Using setUp and tearDown in the same script

This is a feature used by Mozilla and was created years ago. Nowadays you can probably just do everything in one script. 

Scripts can also directly define the ```--preScript``` and ```--postScript``` options by implementing a *setUp* and/or a *tearDown* function. These functions will get the same arguments than the test itself. When using this form, the three functions are declared in *module.exports* under the *setUp*, *tearDown* and *test* keys. This works for commons JS files.

Here's a minimal example:

```JavaScript
async function setUp(context, commands) {
  // do some useful set up
};

async function perfTest(context, commands) {
  // add your own code here
};

async function tearDown(context, commands) {
  // do some cleanup here
};

module.exports = {
  setUp: setUp,
  tearDown: tearDown,
  test: perfTest
};
```
