import type { HttpServer } from '../server/http.ts';

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

export { attachSignalHandlers };
