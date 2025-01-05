import { createServer } from 'node:net';

export async function getAvailablePort(portRange, host = '127.0.0.1') {
  const startPort = portRange[0];
  const endPort = portRange[1];

  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port, host)) {
      return port;
    }
  }

  throw new Error(`No available ports found in range ${startPort}-${endPort}`);
}

function isPortAvailable(port, host) {
  return new Promise(resolve => {
    const server = createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
  });
}
