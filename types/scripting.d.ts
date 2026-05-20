export { Context as BrowsertimeContext } from './core/engine/context';
export { Commands as BrowsertimeCommands } from './core/engine/commands';

import { Context as BrowsertimeContext } from './core/engine/context';
import { Commands as BrowsertimeCommands } from './core/engine/commands';

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
  context: BrowsertimeContext,
  commands: BrowsertimeCommands
) => Promise<unknown>;
