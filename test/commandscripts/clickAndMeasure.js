module.exports = async function(context, commands) {
  await commands.navigate('https://www.sitespeed.io/');
  await commands.measure.start('documentation');
  await commands.click.byLinkTextAndWait('Documentation');
  await commands.measure.stop();
};
