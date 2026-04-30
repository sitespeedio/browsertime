module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/spa/');
  await commands.measure.start('soft-nav');
  await commands.mouse.singleClick.bySelector('#goto-page-2');
  await commands.wait.byTime(2000);
  return commands.measure.stop();
};
