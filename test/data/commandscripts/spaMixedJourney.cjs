module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/spa/');
  // A soft navigation without any request
  await commands.measure.start('spa-about');
  await commands.mouse.singleClick.bySelector('#nav-about');
  await commands.wait.byPageToComplete();
  await commands.measure.stop();
  // A classic hard navigation in the middle of the journey
  await commands.measure.start('http://127.0.0.1:3000/simple/');
  // Back into the SPA for a soft navigation with a request
  await commands.navigate('http://127.0.0.1:3000/spa/');
  await commands.measure.start('spa-products');
  await commands.mouse.singleClick.bySelector('#nav-products');
  await commands.wait.byPageToComplete();
  return commands.measure.stop();
};
