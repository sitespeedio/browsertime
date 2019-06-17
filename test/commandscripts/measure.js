module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
