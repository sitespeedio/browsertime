module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.measure.start('dimple');
  await commands.click.byLinkTextAndWait('Dimple');
  return commands.measure.stop();
};
