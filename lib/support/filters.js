import { promisify } from 'node:util';
import { stat as _stat } from 'node:fs';
import path from 'node:path';
const stat = promisify(_stat);

/**
 * Filters to use with Array.prototype.filter, e.g. ['/a/path', '/another/path'].filter(onlyFiles)
 */
export function onlyWithExtension(extension) {
  return filepath => path.extname(filepath) === extension;
}
export async function onlyFiles(filepath) {
  const stats = await stat(filepath);
  return stats.isFile();
}
export async function onlyDirectories(filepath) {
  const stats = await stat(filepath);
  return stats.isDirectory();
}
