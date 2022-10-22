import handler from 'serve-handler';
import { createServer } from 'node:http';

let server;
const port = 3000;

export async function startServer() {
  server = createServer((request, response) => {
    return handler(request, response, { public: './test/data/html/' });
  });

  return server.listen(port, () => {});
}
export async function stopServer() {
  return server.close();
}
