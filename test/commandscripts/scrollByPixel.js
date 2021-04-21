module.exports = async function(context, commands) {
  await commands.measure.start('scroll');
  await commands.navigate(
    'https://www.sitespeed.io/documentation/sitespeed.io/scripting/'
  );

  await commands.scroll.toBottom(20);
  return commands.measure.stop();
};
