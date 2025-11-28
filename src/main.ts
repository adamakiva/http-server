import { HttpServer } from './server/http.ts';
import { ConfigurationManager } from './utilities/configuration.ts';
import { attachSignalHandlers } from './utilities/general.ts';

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
    },
    baseUrl: baseUrl,
    port,
  }).start();

  attachSignalHandlers(server, forceCloseTimeout);
}

/******************************************************************************************************/

await main();
