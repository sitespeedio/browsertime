'use strict';

const Promise = require('bluebird');
const http = require('http');

Promise.promisifyAll(http.Server);

module.exports = {
  async startServer() {
    const server = http.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Referrer-Policy': 'no-referrer'
      });
      res.end('Browsertime internal server');
    });

    return server.listenAsync().return(server);
  },
  async stopServer(server) {
    return server.closeAsync();
  }
};
