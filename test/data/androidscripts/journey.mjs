export default async function (context, commands) {
  const model = await commands.android.shell('getprop ro.product.model');
  await commands.measure.start('https://www.sitespeed.io/');
  await commands.measure.start('https://www.sitespeed.io/documentation/');
  await commands.scroll.toBottom();
  await commands.screenshot.take('docs-bottom');
  commands.measure.add('phoneModel', model.trim());
}
