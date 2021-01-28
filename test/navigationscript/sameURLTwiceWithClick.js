module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io/documentation/');
  await commands.measure.start('https://www.sitespeed.io');
  // Hide everything
  // We do not hide the body since the body needs to be visible when we do the magic to find the staret of the
  // navigation by adding a layer of orange on top of the page
  await commands.js.run(
    'for (let node of document.body.childNodes) { if (node.style) node.style.display = "none";}'
  );
  // Start measurning
  await commands.measure.start();
  // Click on the link for /documentation/ and wait on navigation to happen
  await commands.click.bySelectorAndWait(
    'body > nav > div > div > div > ul > li:nth-child(2) > a'
  );
  return commands.measure.stop();
};
