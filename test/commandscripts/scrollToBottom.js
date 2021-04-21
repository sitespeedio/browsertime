module.exports = async function(context, commands) {
  await commands.measure.start('scroll');
  await commands.navigate('https://github.com/sitespeedio/browsertime');
  await commands.wait.byTime(1000);

  await commands.wait.byTime(50);

  for (let i = 0; i < 10; i++) {
    await commands.scroll.byPixels(0, 200);
    await commands.wait.byTime(50);
  }

  await commands.wait.byTime(1000);
  return commands.measure.stop();
};
