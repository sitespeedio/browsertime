module.exports = async function(context, commands) {
  const responses = [];
  await commands.cdp.on('Network.responseReceived', params => {
    responses.push(params);
  });
  await commands.measure.start('https://www.sitespeed.io/search/');
  await commands.cdp.send('Network.clearBrowserCookies');
  await commands.cdp.sendAndGet('Memory.getDOMCounters');
};
