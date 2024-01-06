module.exports = async function (context, commands) {

  await commands.measure.start('https://www.selenium.dev/selenium/web/mouse_interaction.html');
  const clickable = await commands.element.getById('clickable');
  return commands.action.getActions()
        .move({ origin: clickable })
        .pause(1000)
        .press()
        .pause(1000)
        .sendKeys('abc')
        .perform();
 
};
