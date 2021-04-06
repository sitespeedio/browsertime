module.exports = async function(context, commands) {
  await commands.measure.start();
  await commands.wait.byTime(50);

  await commands.switch.toNewTab('https://www.sitespeed.io/');
  await commands.switch.toNewWindow('https://www.sitespeed.io/');

  await commands.measure.stop();

  return;
};
