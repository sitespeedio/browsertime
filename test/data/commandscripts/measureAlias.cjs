module.exports = async function (context, commands) {
  await commands.measure.start('http://127.0.0.1:3000/simple/', 'url1');
  return commands.measure.start('http://127.0.0.1:3000/dimple/', 'url2');
};
