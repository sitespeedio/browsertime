module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.click('link:Dimple', { waitForNavigation: true });
  await commands.click('a[href="/simple/"]', { waitForNavigation: true });
  await commands.click('xpath:/html/body/p[2]/a', { waitForNavigation: true });
  await commands.measure.start('simple');
  await commands.click('link:Search', { waitForNavigation: true });
  return commands.measure.stop();
};
