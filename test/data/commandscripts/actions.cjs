module.exports = async function (context, commands) {
  await commands.measure.start('http://127.0.0.1:3000/simple/');
  const clickable = await commands.element.getById('clickable');
  return commands.action.getActions()
        .move({ origin: clickable })
        .pause(1000)
        .press()
        .pause(1000)
        .sendKeys('abc')
        .perform();
 
};
