import test from 'ava';
import { getMainDocuments } from '../../lib/support/har/index.js';

function getHar() {
  return {
    log: {
      version: '1.2',
      pages: [
        {
          id: 'page_1',
          _url: 'https://en.m.wikipedia.org/wiki/Sweden'
        }
      ],
      entries: [
        {
          pageref: 'page_1',
          request: { url: 'https://en.m.wikipedia.org/wiki/Sweden' },
          response: {
            status: 301,
            redirectURL: 'https://en.wikipedia.org/wiki/Sweden',
            headers: [
              {
                name: 'Location',
                value: 'https://en.wikipedia.org/wiki/Sweden'
              }
            ]
          }
        },
        {
          pageref: 'page_1',
          request: { url: 'https://en.wikipedia.org/wiki/Sweden' },
          response: {
            status: 200,
            redirectURL: '',
            headers: [
              { name: 'X-Cache-Status', value: 'hit-front' },
              { name: 'Age', value: '51265' },
              { name: 'Set-Cookie', value: 'secret=1' },
              { name: 'Server-Timing', value: 'cache;desc="hit-front"' }
            ]
          }
        },
        {
          pageref: 'page_1',
          request: { url: 'https://en.wikipedia.org/static/logo.png' },
          response: {
            status: 200,
            redirectURL: '',
            headers: [{ name: 'X-Cache-Status', value: 'miss' }]
          }
        }
      ]
    }
  };
}

test('Follow the redirect chain to the main document', t => {
  const documents = getMainDocuments(getHar());
  t.is(documents.length, 1);
  t.is(documents[0].url, 'https://en.m.wikipedia.org/wiki/Sweden');
  t.deepEqual(documents[0].mainDocument, {
    url: 'https://en.wikipedia.org/wiki/Sweden',
    status: 200,
    redirects: 1,
    headers: {
      'x-cache-status': 'hit-front',
      age: '51265',
      'server-timing': 'cache;desc="hit-front"'
    }
  });
});

test('Lowercase header names in the output', t => {
  const documents = getMainDocuments(getHar());
  t.true('x-cache-status' in documents[0].mainDocument.headers);
  t.false('X-Cache-Status' in documents[0].mainDocument.headers);
});

test('Always drop sensitive headers', t => {
  const har = getHar();
  har.log.entries[1].response.headers.push({
    name: 'Authorization',
    value: 'Bearer secret'
  });
  const documents = getMainDocuments(har);
  t.false('set-cookie' in documents[0].mainDocument.headers);
  t.false('authorization' in documents[0].mainDocument.headers);
});

test('Report zero redirects when the first response is the document', t => {
  const har = getHar();
  har.log.entries.shift();
  const documents = getMainDocuments(har);
  t.is(documents[0].mainDocument.redirects, 0);
  t.is(documents[0].mainDocument.url, 'https://en.wikipedia.org/wiki/Sweden');
});

test('Join multiple headers with the same name', t => {
  const har = getHar();
  har.log.entries[1].response.headers.push({
    name: 'server-timing',
    value: 'host;desc="cp1234"'
  });
  const documents = getMainDocuments(har);
  t.is(
    documents[0].mainDocument.headers['server-timing'],
    'cache;desc="hit-front", host;desc="cp1234"'
  );
});

test('Skip pages without an URL and handle empty entries', t => {
  const har = getHar();
  har.log.pages.push(
    { id: 'page_2' },
    { id: 'page_3', _url: 'https://example.com' }
  );
  const documents = getMainDocuments(har);
  t.is(documents.length, 1);
});
