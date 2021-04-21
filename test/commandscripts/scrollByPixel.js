module.exports = async function(context, commands) {
  await commands.navigate(
    'https://www.sitespeed.io/documentation/sitespeed.io/scripting/'
  );

  return commands.scroll.toBottom(20);
};
