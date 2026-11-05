module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.measure.start('first');
  commands.stopWatch.get('First_stopwatch').stopAndAdd();
  await commands.measure.stop();
  await commands.navigate('http://127.0.0.1:3000/dimple/');
  await commands.measure.start('second');
  commands.stopWatch.get('Second_stopwatch').stopAndAdd();
  return commands.measure.stop();
};
