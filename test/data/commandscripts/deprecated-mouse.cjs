module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.wait.byTime(1000);
  await commands.mouse.contextClick.byXpath('//html/body/p[2]/a');
  await commands.wait.byTime(5000);

  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.wait.byTime(1000);
  await commands.mouse.singleClick.byXpath('/html/body/p[2]/a');
  await commands.wait.byTime(5000);

  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.mouse.singleClick.bySelector('body > p:nth-child(4) > a');
  await commands.wait.byTime(5000);

  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.mouse.doubleClick.bySelector('body > p:nth-child(4) > a');
  await commands.wait.byTime(5000);

  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.mouse.mouseMove.bySelector('body > p:nth-child(4) > a');
  await commands.mouse.mouseMove.byXpath('/html/body/p[2]/a');
  return commands.mouse.mouseMove.toPosition(1, 1);
};
