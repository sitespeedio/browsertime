import test from 'ava';
import path from 'node:path';
import { pathToFolder } from '../../lib/support/pathToFolder.js';

const url = 'https://www.sitespeed.io/';

function folderForAlias(alias) {
  return pathToFolder(url, { urlMetaData: { [url]: alias } });
}

test('Keep Unicode letters in an alias', t => {
  t.is(
    folderForAlias('café'),
    path.join('pages', 'www_sitespeed_io', 'café', 'data') + path.sep
  );
  t.is(
    folderForAlias('日本語'),
    path.join('pages', 'www_sitespeed_io', '日本語', 'data') + path.sep
  );
  t.is(
    folderForAlias('الصفحة'),
    path.join('pages', 'www_sitespeed_io', 'الصفحة', 'data') + path.sep
  );
});

test('Replace unsafe characters in an alias', t => {
  t.is(
    folderForAlias('foo:bar `date`'),
    path.join('pages', 'www_sitespeed_io', 'foo-bar--date-', 'data') + path.sep
  );
});

test('Store the URL as a short hash', t => {
  const folder = pathToFolder(`${url}a/very/long/path?with=query`, {
    storeURLsAsHash: true
  });
  t.regex(
    folder,
    new RegExp(
      `^pages\\${path.sep}www_sitespeed_io\\${path.sep}[\\da-f]{8}\\${path.sep}data\\${path.sep}$`,
      'u'
    )
  );
  t.not(folder, pathToFolder(url, { storeURLsAsHash: true }));
});
