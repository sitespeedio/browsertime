import type { Context } from './types/core/engine/context.js';
import type { Commands } from './types/core/engine/commands.js';

export { Context as BrowsertimeContext } from './types/core/engine/context.js';
export { Commands as BrowsertimeCommands } from './types/core/engine/commands.js';

/**
 * Signature of a Browsertime user script. Annotate the default export of
 * your script with this type to get full IntelliSense on `context` and
 * `commands`.
 *
 * @example
 * /** @type {import('browsertime').BrowsertimeScript} *\/
 * export default async function (context, commands) {
 *   await commands.measure.start('https://example.org');
 * }
 */
export type BrowsertimeScript = (
  context: Context,
  commands: Commands
) => Promise<unknown>;
