'use strict';

const Promise = require('bluebird');
const http = require('http');

Promise.promisifyAll(http.Server);

module.exports = {
  startServer() {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Browsertime internal server');
    });

    return server.listenAsync().return(server);
  },
  stopServer(server) {
    return server.closeAsync();
  }
};
