const handler = require('serve-handler');
const http = require('http');

let server;
const port = 3000;

module.exports = {
  async startServer() {
    server = http.createServer((request, response) => {
      return handler(request, response, { public: './test/data/html/' });
    });

    return server.listen(port, () => {});
  },

  async stopServer() {
    return server.close();
  }
};
