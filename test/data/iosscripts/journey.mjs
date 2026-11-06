export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io/');
  await commands.measure.start('https://www.sitespeed.io/documentation/');
  await commands.scroll.toBottom();
  await commands.screenshot.take('docs-bottom');
  commands.measure.add(
    'userAgent',
    await commands.js.run('return navigator.userAgent')
  );
}
