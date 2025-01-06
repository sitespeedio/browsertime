import path from 'node:path';
import { promisify } from 'node:util';
import {
  readdir as _readdir,
  lstat as _lstat,
  unlink as _unlink,
  rmdir as _rmdir,
  copyFile as _copyFile,
  rename as _rename,
  readFile as _readFile,
  copyFileSync as _copyFileSync,
  unlinkSync as _unlinkSync,
  existsSync
} from 'node:fs';
import { getLogger } from '@sitespeed.io/log';
import { onlyFiles, onlyWithExtension } from './filters.js';
const readdir = promisify(_readdir);
const lstat = promisify(_lstat);
const unlink = promisify(_unlink);
const rmdir = promisify(_rmdir);
const copyFile2 = promisify(_copyFile);
const rename2 = promisify(_rename);
const readFile2 = promisify(_readFile);
const log = getLogger('browsertime');

export async function rename(old, newName) {
  return rename2(old, newName);
}

export function copyFileSync(source, destination) {
  return _copyFileSync(source, destination);
}

export async function removeFileSync(fileName) {
  return _unlinkSync(fileName);
}

export async function copyFile(source, destination) {
  return copyFile2(source, destination);
}
export async function removeFile(fileName) {
  return unlink(fileName);
}
export async function readFile(fileName) {
  return readFile2(fileName);
}
export async function removeDirAndFiles(dirName) {
  const removeDir = async dir => {
    try {
      const files = await readdir(dir);
      await Promise.all(
        files.map(async file => {
          try {
            const p = path.join(dir, file);
            const stat = await lstat(p);
            await (stat.isDirectory() ? removeDir(p) : unlink(p));
          } catch (error) {
            log.error('Could not remove file:' + file, error);
          }
        })
      );
      await rmdir(dir);
    } catch (error) {
      log.error('Could not remove dir:' + dir, error);
    }
  };
  return removeDir(dirName);
}
export async function removeByType(dir, type) {
  const fileNames = await readdir(dir);
  const filePaths = fileNames
    .map(fileName => path.join(dir, fileName))
    .filter(element => onlyFiles(element))
    .filter(onlyWithExtension('.' + type));

  for (const filePath of filePaths) {
    await unlink(filePath);
  }
}
export async function findFiles(dir, filter) {
  const fileNames = await readdir(dir);
  const filePaths = fileNames.filter(fileName => {
    return fileName.includes(filter);
  });
  return filePaths;
}

export function findUpSync(filenames, startDir = process.cwd()) {
  let currentDir = startDir;

  while (currentDir !== path.dirname(currentDir)) {
    for (const filename of filenames) {
      const filePath = path.resolve(currentDir, filename);
      if (existsSync(filePath)) {
        return filePath;
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return;
}
