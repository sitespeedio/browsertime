module.exports = async function (context, commands) {
  const before = commands.stopWatch.get('Before_navigating_page');
  await commands.navigate('http://127.0.0.1:3000/simple/');
  before.stop();
  const measure = commands.stopWatch.get('Measured_page');
  await commands.measure.start('http://127.0.0.1:3000/dimple/');
  return measure.stopAndAdd();
};
