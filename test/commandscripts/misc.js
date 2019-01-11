module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io/search/');
  await commands.addText('grafana', 'search-input');
  await commands.wait.byTime(100);
  await commands.js.run('document.body.style.backgroundColor="red"');
};
