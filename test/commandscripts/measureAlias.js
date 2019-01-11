module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io', 'url1');
  return commands.measure.start(
    'https://www.sitespeed.io/documentation/',
    'url2'
  );
};
