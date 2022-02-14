module.exports = async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  await commands.navigate('about:blank');
  return commands.measure.start('https://www.sitespeed.io');
};
