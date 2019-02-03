module.exports = async function(context, commands) {
  await commands.navigate('https://www.sitespeed.io/');
  await commands.click.byPartialLinkTextAndWait('Blo');
  await commands.click.bySelectorAndWait(
    'body > nav > div > div > div > ul > li:nth-child(5) > a'
  );
  await commands.click.byXpathAndWait('/html/body/nav/div/div/div/ul/li[6]/a');
  await commands.measure.start('documentation');
  await commands.click.byLinkTextAndWait('Documentation');
  await commands.measure.stop();
};
