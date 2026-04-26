module.exports = async function (context, commands) {
  // Navigate to search page
  await commands.navigate('http://127.0.0.1:3000/search/');

  // Test addText with unified selector
  await commands.addText('id:search-input', 'browsertime');

  // Test getValue
  const value = await commands.getValue('#search-input');
  if (value !== 'browsertime') {
    throw new Error(`Expected 'browsertime' but got '${value}'`);
  }

  // Test getText
  const heading = await commands.getText('h1');
  if (!heading.includes('search')) {
    throw new Error(`Expected heading to contain 'search' but got '${heading}'`);
  }

  // Test clear
  await commands.clear('#search-input');
  const clearedValue = await commands.getValue('#search-input');
  if (clearedValue !== '') {
    throw new Error(`Expected empty value after clear but got '${clearedValue}'`);
  }

  // Test fill
  await commands.fill({
    '#search-input': 'filled by fill command'
  });
  const filledValue = await commands.getValue('#search-input');
  if (filledValue !== 'filled by fill command') {
    throw new Error(`Expected 'filled by fill command' but got '${filledValue}'`);
  }

  // Test isVisible
  const visible = await commands.isVisible('#search-input');
  if (!visible) {
    throw new Error('Expected search input to be visible');
  }

  // Test exists
  const inputExists = await commands.exists('#search-input');
  if (!inputExists) {
    throw new Error('Expected search input to exist');
  }
  const nonExistent = await commands.exists('#does-not-exist');
  if (nonExistent) {
    throw new Error('Expected non-existent element to return false');
  }

  // Navigate to simple page for click and mouse tests
  await commands.measure.start('http://127.0.0.1:3000/simple/');

  // Test mouse.singleClick with unified selector
  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.mouse.moveTo('a[href="/dimple/"]');

  // Test type command
  await commands.type('#clickable', 'typed text');
  const typedValue = await commands.getValue('#clickable');
  if (typedValue !== 'typed text') {
    throw new Error(`Expected 'typed text' but got '${typedValue}'`);
  }

  // Test set command
  await commands.set('#clickable', 'set value');
  const setValue = await commands.getValue('#clickable');
  if (setValue !== 'set value') {
    throw new Error(`Expected 'set value' but got '${setValue}'`);
  }

  // Test wait with unified selector
  await commands.wait('h1', { timeout: 3000 });

  // Test find
  const element = await commands.find('#clickable');
  if (!element) {
    throw new Error('Expected find to return an element');
  }

  // Test getAttribute
  const placeholder = await commands.getAttribute('#clickable', 'placeholder');
  if (placeholder !== 'Clickable') {
    throw new Error(`Expected placeholder 'Clickable' but got '${placeholder}'`);
  }

  // Test isEnabled
  const enabled = await commands.isEnabled('#clickable');
  if (!enabled) {
    throw new Error('Expected input to be enabled');
  }

  // Test hover
  await commands.hover('a[href="/dimple/"]');

  // Test press (type something then press a key)
  await commands.clear('#clickable');
  await commands.type('#clickable', 'test');
  await commands.press('Backspace');

  // Test getTitle
  const title = await commands.getTitle();
  if (!title.includes('simple')) {
    throw new Error(`Expected title to contain 'simple' but got '${title}'`);
  }

  // Test getUrl
  const url = await commands.getUrl();
  if (!url.includes('127.0.0.1')) {
    throw new Error(`Expected url to contain '127.0.0.1' but got '${url}'`);
  }

  // Test cookie commands
  await commands.cookie.deleteAll();
  await commands.cookie.set('test_cookie', 'browsertime');
  const cookie = await commands.cookie.get('test_cookie');
  if (!cookie || cookie.value !== 'browsertime') {
    throw new Error('Cookie set/get failed');
  }
  await commands.cookie.delete('test_cookie');
  const deleted = await commands.cookie.get('test_cookie');
  if (deleted) {
    throw new Error('Cookie delete failed');
  }

  // Test scrollIntoView
  await commands.scrollIntoView('h1');

  // Test waitForUrl (we're already on the simple page)
  await commands.waitForUrl('simple', { timeout: 3000 });

  // Test select and select.byText on the search page
  await commands.navigate('http://127.0.0.1:3000/search/');
  await commands.select('#search-category', 'blog');
  const selectValue = await commands.getValue('#search-category');
  if (selectValue !== 'blog') {
    throw new Error(`Expected select value 'blog' but got '${selectValue}'`);
  }

  await commands.select.byText('#search-category', 'API Reference');
  const selectValueAfterByText = await commands.getValue('#search-category');
  if (selectValueAfterByText !== 'api') {
    throw new Error(
      `Expected select value 'api' after byText but got '${selectValueAfterByText}'`
    );
  }

  // Test check/uncheck/isChecked
  const isCheckedBefore = await commands.isChecked('#exact-match');
  if (isCheckedBefore) {
    throw new Error('Expected checkbox to be unchecked initially');
  }
  await commands.check('#exact-match');
  const isCheckedAfter = await commands.isChecked('#exact-match');
  if (!isCheckedAfter) {
    throw new Error('Expected checkbox to be checked after check()');
  }
  await commands.uncheck('#exact-match');
  const isCheckedFinal = await commands.isChecked('#exact-match');
  if (isCheckedFinal) {
    throw new Error('Expected checkbox to be unchecked after uncheck()');
  }

  // Test clickAndMeasure
  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.measure.clickAndMeasure('dimple', 'a[href="/dimple/"]');
};
