'use strict';

const { promisify } = require('util');
const http = require('http');

module.exports = {
  async startServer() {
    const server = http.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Referrer-Policy': 'no-referrer'
      });
      res.end('<html><body></body></html>');
    });

    const listen = promisify(server.listen.bind(server));
    await listen();
    return server;
  },
  async stopServer(server) {
    const close = promisify(server.close.bind(server));
    return close();
  }
};
