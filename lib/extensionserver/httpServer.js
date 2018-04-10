'use strict';

const { promisify } = require('util');
const http = require('http');

module.exports = {
  async startServer() {
    const server = http.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Referrer-Policy': 'no-referrer'
      });
      res.end('Browsertime internal server');
    });

    server._close = server.close;
    server.close = promisify(cb => server._close(cb));
    server._listen = server.listen;
    server.listen = promisify(cb => server._listen(cb));
    await server.listen();
    return server;
  },
  async stopServer(server) {
    return server.close();
  }
};
