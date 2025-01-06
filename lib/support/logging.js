// configure.js
import { configureLog } from '@sitespeed.io/log';

/**
 * Adapted from old intel-based configure logic.
 *
 * @param {Object} options
 * @param {number} [options.verbose=0] - 0: Info, 1: Debug, 2: Verbose, 3: Trace
 * @param {boolean} [options.silent=false] - If true, disables logging
 */
export function configure(options = {}) {
  configureLog({
    verbose: options.verbose ?? 0,
    silent: options.silent ?? false
  });
}
