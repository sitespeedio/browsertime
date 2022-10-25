import { promisify } from 'node:util';
import { createServer } from 'node:http';

export async function startServer() {
  const server = createServer((request, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Referrer-Policy': 'no-referrer'
    });
    res.end('<html><body></body></html>');
  });

  const listen = promisify(server.listen.bind(server));
  await listen();
  return server;
}
export async function stopServer(server) {
  const close = promisify(server.close.bind(server));
  return close();
}
