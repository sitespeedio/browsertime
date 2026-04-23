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
export async function executeCommand(
  log,
  errorMessage,
  identifier,
  fn,
  browser
) {
  try {
    return await fn();
  } catch (error) {
    let url = '';
    if (browser) {
      try {
        url = ` on ${await browser.getDriver().getCurrentUrl()}`;
      } catch {
        // If we can't get the URL, just skip it
      }
    }
    const baseMessage =
      identifier === undefined
        ? errorMessage
        : errorMessage.replace('%s', String(identifier));
    if (identifier === undefined) {
      log.error(errorMessage);
    } else {
      log.error(errorMessage, identifier);
    }
    log.verbose(error);
    throw new Error(`${baseMessage}${url}`);
  }
}
