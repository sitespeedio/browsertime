/** @type {import('../../../scripting.d.ts').BrowsertimeScript} */
export default async function (context, commands) {
  await commands.measure.start('https://demo.playwright.dev/todomvc/');

  const page = await commands.playwright.getPage();

  const input = page.getByPlaceholder('What needs to be done?');
  for (const item of ['Buy milk', 'Walk dog', 'Write code']) {
    await input.fill(item);
    await input.press('Enter');
  }

  const milk = page.getByTestId('todo-item').filter({ hasText: 'Buy milk' });
  await milk.getByRole('checkbox').check();

  await page.getByRole('link', { name: 'Active' }).click();

  const remaining = await page.getByTestId('todo-count').textContent();
  context.log.info('TodoMVC says: %s', remaining);

  const screenshotDir = context.storageManager.directory;
  await page
    .locator('.todo-list')
    .screenshot({ path: `${screenshotDir}/todo-list.png` });
  context.log.info('Saved locator-scoped screenshot to %s', screenshotDir);

  return remaining;
}
