export default async function (context, commands) {
  await commands.perfetto.start();
  await commands.measure.start('https://www.sitespeed.io/');
  await commands.perfetto.stop();
}
