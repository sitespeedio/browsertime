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

export { Engine as BrowsertimeEngine } from './lib/core/engine/index.js';
export { configure as configureLogging } from './lib/support/logging.js';
