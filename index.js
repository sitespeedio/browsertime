import {
  defaultScriptCategories,
  allScriptCategories,
  getScriptsForCategories,
  findAndParseScripts
} from './lib/support/browserScript.js';

export const browserScripts = {
  defaultScriptCategories,
  allScriptCategories,
  getScriptsForCategories,
  findAndParseScripts
};

export { Engine } from './lib/core/engine/index.js';
export { logging as configureLogging } from './lib/support/logging.js';
