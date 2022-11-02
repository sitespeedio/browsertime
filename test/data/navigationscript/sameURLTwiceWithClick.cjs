module.exports = async function (context, commands) {
  await commands.measure.start('http://127.0.0.1:3000/simple/');
  await commands.measure.start('http://127.0.0.1:3000/dimple/');
  // Hide everything
  // We do not hide the body since the body needs to be visible when we do the magic to find the staret of the
  // navigation by adding a layer of orange on top of the page
  await commands.js.run(
    'for (let node of document.body.childNodes) { if (node.style) node.style.display = "none";}'
  );
  // Start measurning
  await commands.measure.start();
  // Click on the link for /simple/ and wait on navigation to happen
  await commands.click.byLinkText('Simple');

  return commands.measure.stop();
};
