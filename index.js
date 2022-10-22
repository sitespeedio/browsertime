import Engine from './lib/core/engine/index.js';
import {
  defaultScriptCategories,
  allScriptCategories,
  getScriptsForCategories,
  findAndParseScripts
} from './lib/support/browserScript.js';
import logging from './lib/support/logging.js';

export default {
  Engine,
  logging,
  browserScripts: {
    defaultScriptCategories,
    allScriptCategories,
    getScriptsForCategories,
    findAndParseScripts
  }
};
