import { createApp } from './app';
import { loadConfig } from './config';
import { createContainer } from './container';

const config = loadConfig();
const container = createContainer(config);
const app = createApp(container.services, { clientDir: config.clientDir });

const server = app.listen(config.port, () => {
  console.log(`movie-services listening on port ${config.port} (${config.env})`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`${signal} received, shutting down`);
  server.close(() => {
    container.close();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
