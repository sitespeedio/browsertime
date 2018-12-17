'use strict';

module.exports = function(urlOrFunctions) {
  return function(context, help) {
    return context.runWithDriver(async function() {
      for (let urlOrFunction of urlOrFunctions) {
        if (typeof urlOrFunction === 'function') {
          await urlOrFunction(context, help);
        } else {
          await help.measure(urlOrFunction);
        }
      }
    });
  };
};
