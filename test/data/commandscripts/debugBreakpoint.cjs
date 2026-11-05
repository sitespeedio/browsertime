module.exports = async function (context, commands) {
  await commands.measure.start('http://127.0.0.1:3000/simple/');
  // Release every breakpoint from the page, so the test runs without a user.
  await commands.js.run(
    'setInterval(() => { if (window.browsertime) window.browsertime.pause = false; }, 100);'
  );
  return commands.debug.breakpoint('test');
};
