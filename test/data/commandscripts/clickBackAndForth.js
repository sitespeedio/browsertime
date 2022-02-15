module.exports = async function (context, commands) {
  await commands.navigate('http://127.0.0.1:3000/simple/');
  await commands.click.byPartialLinkTextAndWait('Dim');
  await commands.click.bySelectorAndWait('body > p:nth-child(4) > a');
  await commands.click.byXpathAndWait('/html/body/p[2]/a');
  await commands.measure.start('simple');
  await commands.click.byLinkTextAndWait('Search');
  return commands.measure.stop();
};
