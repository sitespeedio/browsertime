module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/search/');
  await commands.addText.byId('grafana', 'search-input');
  await commands.set.innerTextById('grafana2', 'search-input');
  await commands.set.innerText('grafana3', '#search-input');
  await commands.wait.byTime(500);
  await commands.js.run('document.body.style.backgroundColor="red"');
  await commands.measure.start('http://127.0.0.1:3000/simple/');
  await commands.navigation.back({ wait: true });
  await commands.navigation.forward({ wait: true });
  await commands.navigation.refresh({ wait: true });

  await commands.switch.toNewTab('http://127.0.0.1:3000/simple/');
  return commands.switch.toNewWindow('http://127.0.0.1:3000/dimple/');
};
