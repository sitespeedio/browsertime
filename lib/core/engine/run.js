'use strict';

module.exports = function(urlOrFunctions) {
  return async function(context, commands) {
    for (let urlOrFunction of urlOrFunctions) {
      if (typeof urlOrFunction === 'function') {
        await urlOrFunction(context, commands);
      } else {
        await commands.measure.start(urlOrFunction);
      }
    }
  };
};
