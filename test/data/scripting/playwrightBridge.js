/** @type {import('../../../scripting.d.ts').BrowsertimeScript} */
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  const page = await commands.playwright.getPage();
  const title = await page.title();
  context.log.info('Playwright sees title: %s', title);
  return title;
}
