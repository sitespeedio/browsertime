module.exports = async function(context, commands) {
  await commands.navigate('https://www.sitespeed.io/documentation/');
  await commands.wait.byTime(1000);
  await commands.mouse.contextClick.byXpath(
    '/html/body/nav/div/div/div/ul/li[3]/a'
  );
  await commands.wait.byTime(5000);

  await commands.navigate('https://www.sitespeed.io/documentation/');
  await commands.wait.byTime(1000);
  await commands.mouse.singleClick.byXpath(
    '/html/body/nav/div/div/div/ul/li[3]/a'
  );
  await commands.wait.byTime(5000);

  await commands.navigate('https://www.sitespeed.io/documentation/');
  await commands.mouse.singleClick.bySelector(
    'body > nav > div > div > div > ul > li:nth-child(5) > a'
  );
  await commands.wait.byTime(5000);

  await commands.navigate('https://www.sitespeed.io/documentation/');
  await commands.mouse.doubleClick.bySelector(
    'body > nav > div > div > div > ul > li:nth-child(5) > a'
  );
  await commands.wait.byTime(5000);

  await commands.navigate('https://www.sitespeed.io/documentation/');
  await commands.mouse.mouseMove.bySelector(
    'body > nav > div > div > div > ul > li:nth-child(5) > a'
  );
  await commands.mouse.mouseMove.byXpath(
    '/html/body/nav/div/div/div/ul/li[3]/a'
  );
  await commands.mouse.mouseMove.toPosition(1, 1);
};
