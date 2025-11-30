import { HttpServer } from './server/http.ts';
import { ConfigurationManager } from './utilities/configuration.ts';

/******************************************************************************************************/

async function main() {
  const {
    httpServer: {
      baseUrl,
      maxHeadersCount,
      headersTimeout,
      requestTimeout,
      timeout,
      maxRequestsPerSocket,
      keepAliveTimeout,
      keepAliveTimeoutBuffer,
      port,
      forceCloseTimeout,
    },
  } = new ConfigurationManager().getEnvVariables();

  const server = await new HttpServer({
    configuration: {
      maxHeadersCount,
      headersTimeout,
      requestTimeout,
      timeout,
      maxRequestsPerSocket,
      keepAliveTimeout,
      keepAliveTimeoutBuffer,
    },
    baseUrl: baseUrl,
    port,
  }).start();

  attachSignalHandlers(server, forceCloseTimeout);
}

/******************************************************************************************************/

function attachSignalHandlers(server: HttpServer, forceCloseTimeout: number) {
  (['SIGINT', 'SIGTERM'] as const).forEach((signal) => {
    process.once(signal, () => {
      shutdown(server, forceCloseTimeout);
    });
  });
}

function forceShutdown(server: HttpServer) {
  console.error('Process did not finish gracefully, force exiting...');
  server.closeAllConnections();

  process.exit(1);
}

function shutdown(server: HttpServer, forceCloseTimeout: number) {
  setTimeout(forceShutdown, forceCloseTimeout, server).unref();

  server.close();
  process.exitCode = 0;
}

/******************************************************************************************************/

await main();
