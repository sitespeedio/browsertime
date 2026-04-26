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
};
