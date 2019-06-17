module.exports = async function(context, commands) {
  await commands.navigate('https://www.sitespeed.io/search/');
  await commands.addText.byId('grafana', 'search-input');
  await commands.set.innerTextById('grafana2', 'search-input');
  await commands.set.innerText('grafana3', '#search-input');
  await commands.wait.byTime(500);
  await commands.js.run('document.body.style.backgroundColor="red"');
  await commands.measure.start('https://www.sitespeed.io/search/');
};
