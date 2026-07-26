module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/spa/');
  // Two consecutive soft navigations that never touch the network
  await commands.measure.start('about');
  await commands.mouse.singleClick.bySelector('#nav-about');
  await commands.wait.byPageToComplete();
  await commands.measure.stop();
  await commands.measure.start('home');
  await commands.mouse.singleClick.bySelector('#nav-home');
  await commands.wait.byPageToComplete();
  return commands.measure.stop();
};
