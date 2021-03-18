module.exports = async function(context, commands) {
  const before = commands.stopWatch.get('Before_navigating_page');
  await commands.navigate('https://www.sitespeed.io/search/');
  before.stop();
  const measure = commands.stopWatch.get('Measured_page');
  await commands.measure.start('https://www.sitespeed.io/');
  measure.stopAndAdd();
};
