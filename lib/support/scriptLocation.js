import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const browsertimeLib =
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') + path.sep;
const nodeModules = `${path.sep}node_modules${path.sep}`;

/**
 * Find where in the user script an error happened, using the stack trace.
 * Frames in Browsertime and in dependencies are skipped.
 * @param {Error} error
 * @returns {string|undefined} The file, line and code, like
 *   "/path/test.mjs line 3: await commands.foo.run();"
 */
export function getScriptLocation(error) {
  for (const frame of String(error?.stack).split('\n')) {
    const match = frame.match(/\(?((?:file:\/\/)?[^\s()]+):(\d+):\d+\)?$/);
    if (!match) continue;
    const file = match[1].startsWith('file://')
      ? fileURLToPath(match[1])
      : match[1];
    if (
      !path.isAbsolute(file) ||
      file.startsWith(browsertimeLib) ||
      file.includes(nodeModules)
    ) {
      continue;
    }
    const lineNumber = Number(match[2]);
    let code;
    try {
      code = readFileSync(file, 'utf8').split('\n')[lineNumber - 1].trim();
    } catch {
      // Keep the location without the code
    }
    return code
      ? `${file} line ${lineNumber}: ${code}`
      : `${file} line ${lineNumber}`;
  }
}
