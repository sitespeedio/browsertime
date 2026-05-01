/**
 * Shared error handling wrapper for command methods.
 *
 * Most command methods follow the same try/catch pattern:
 * log.error + log.verbose + throw new Error. This helper
 * eliminates that boilerplate.
 *
 * @param {Object} log - The logger instance.
 * @param {string} errorMessage - printf-style message (with %s placeholder).
 * @param {string|undefined} identifier - Value to interpolate into the message, or undefined if none.
 * @param {Function} fn - The async function to execute.
 * @param {Object} [browser] - Optional browser instance. When provided, the current page URL is appended to the error message.
 * @returns {Promise<*>} The return value of fn.
 */
export function executeCommand(log: any, errorMessage: string, identifier: string | undefined, fn: Function, browser?: any): Promise<any>;
//# sourceMappingURL=commandHelper.d.ts.map