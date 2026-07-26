module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/spa/');
  await commands.measure.start('soft-nav-no-request');
  await commands.mouse.singleClick.bySelector('#goto-page-3');
  await commands.wait.byTime(2000);
  return commands.measure.stop();
};
