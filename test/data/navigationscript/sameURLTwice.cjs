module.exports = async function (context, commands) {
  await commands.measure.start('http://127.0.0.1:3000/simple/');
  await commands.navigate('about:blank');
  return commands.measure.start('http://127.0.0.1:3000/simple/');
};
