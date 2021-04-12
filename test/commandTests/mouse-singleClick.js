module.exports = async function(context, commands) {
  await commands.navigate('https://www.sitespeed.io/documentation/');
  await commands.wait.byTime(1000);

  await commands.measure.start();
  await commands.wait.byTime(50);
  await commands.mouse.singleClick.byXpath(
    '/html/body/nav/div/div/div/ul/li[3]/a'
  );
  await commands.wait.byTime(5000);
  await commands.measure.stop();

  return;
};
