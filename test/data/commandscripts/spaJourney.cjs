module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/spa/');
  // A route that fetches data before it can render
  await commands.measure.start('products');
  await commands.mouse.singleClick.bySelector('#nav-products');
  await commands.wait.byPageToComplete();
  await commands.measure.stop();
  // A route rendered entirely from memory, no requests
  await commands.measure.start('about');
  await commands.mouse.singleClick.bySelector('#nav-about');
  await commands.wait.byPageToComplete();
  await commands.measure.stop();
  // A route that loads an image
  await commands.measure.start('gallery');
  await commands.mouse.singleClick.bySelector('#nav-gallery');
  await commands.wait.byPageToComplete();
  return commands.measure.stop();
};
