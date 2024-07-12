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

export { Commands as BrowsertimeCommands } from './lib/core/engine/commands.js';
export { Context as BrowsertimeContext } from './lib/core/engine/context.js';
