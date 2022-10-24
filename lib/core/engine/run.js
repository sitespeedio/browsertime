export default function (urlOrFunctions) {
  return async function (context, commands) {
    for (let urlOrFunction of urlOrFunctions) {
      await (typeof urlOrFunction === 'function'
        ? urlOrFunction(context, commands)
        : commands.measure.start(urlOrFunction));
    }
  };
}
