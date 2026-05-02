module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/hidden/');
  // Recommended pattern for visual-metric scripts: hide every body child
  // before the click so the click itself does not trigger an early visual change.
  await commands.js.run(
    'for (const node of document.body.childNodes) { if (node.style) node.style.display = "none"; }'
  );
  await commands.click('id:hiddenButton');
  // The button's onclick sets document.title to 'clicked'. If the click
  // silently missed (e.g. Actions API moving to a zero-size bbox at 0,0),
  // the title stays 'HiddenClick' and we fail loudly here.
  const title = await commands.js.run('return document.title;');
  if (title !== 'clicked') {
    throw new Error(
      `Hidden-element click did not fire — document.title is ${JSON.stringify(title)}`
    );
  }
};
