module.exports = async function (context, commands) {

  const params = {
    method: 'script.addPreloadScript',
    params: {
      functionDeclaration: 'function(){alert("hepp");}'
    }
  };

  await commands.bidi.send(params);

  await commands.profiler.start();
  await commands.measure.start('http://127.0.0.1:3000/simple/');
  return commands.profiler.stop();
};
