module.exports = async function(context, commands) {
  await commands.navigate('https://www.sitespeed.io/search/');
  await commands.cdp.send('Network.clearBrowserCookies');
  await commands.cdp.sendAndGet('Memory.getDOMCounters');
};
