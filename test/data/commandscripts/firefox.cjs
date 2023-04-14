module.exports = async function (context, commands) {

  await commands.profiler.start();
  await commands.measure.start('http://127.0.0.1:3000/simple/');
  return commands.profiler.stop();
};
