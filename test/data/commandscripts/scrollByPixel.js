module.exports = async function (context, commands) {
  await commands.measure.start('scroll');
  await commands.navigate('http://127.0.0.1:3000/simple/');

  await commands.scroll.toBottom(20);
  return commands.measure.stop();
};
