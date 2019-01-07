'use strict';

module.exports = function(urlOrFunctions) {
  return async function(context, commands) {
    for (let urlOrFunction of urlOrFunctions) {
      if (typeof urlOrFunction === 'function') {
        await urlOrFunction(context);
      } else {
        await commands.measure.startAndNavigate(urlOrFunction);
      }
    }
  };
};
