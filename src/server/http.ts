import { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { EnvironmentVariables } from '../utilities/configuration.ts';

import { createRouter } from '../router/index.ts';

/******************************************************************************************************/

type Configuration = Pick<
  EnvironmentVariables['httpServer'],
  | 'maxHeadersCount'
  | 'headersTimeout'
  | 'requestTimeout'
  | 'timeout'
  | 'maxRequestsPerSocket'
  | 'keepAliveTimeout'
  | 'keepAliveTimeoutBuffer'
>;

/******************************************************************************************************/

class HttpServer extends Server {
  readonly #port;
  readonly #router;

  public constructor(parameters: { configuration: Configuration; baseUrl: string; port: number }) {
    super();

    const { configuration, baseUrl, port } = parameters;

    this.#port = port;
    this.#router = createRouter(baseUrl);
    this.#attachServerConfigurations(configuration).#attachEventHandlers();
  }

  public async start() {
    return await new Promise<this>((resolve) => {
      this.once('listening', () => {
        // Can be asserted since this is not a unix socket and we are inside
        // the `listening` event handler
        const { address, port } = this.address() as AddressInfo;

        console.info(
          `Server is running on: ${address.endsWith(':') ? address : `${address}:`}${port}`,
        );

        resolve(this);
      });

      // Undefined port will assign a random port which will be resolved in the
      // `listening` event handler
      this.listen(this.#port);
    });
  }

  public override close(callback?: (error?: Error) => void) {
    this.removeListener('request', this.#router.handler);

    return super.close(callback);
  }

  /****************************************************************************************************/

  #attachServerConfigurations(configuration: Omit<Configuration, 'port'>) {
    const {
      maxHeadersCount,
      headersTimeout,
      requestTimeout,
      timeout,
      maxRequestsPerSocket,
      keepAliveTimeout,
      keepAliveTimeoutBuffer,
    } = configuration;

    // Every configuration referring to sockets here, talks about network/tcp
    // socket NOT websockets. Network socket is the underlying layer for http
    // request (in this case). In short, the socket options refer to a "standard"
    // connection from a client
    this.maxHeadersCount = maxHeadersCount;
    this.headersTimeout = headersTimeout;
    this.requestTimeout = requestTimeout;
    // Connection close will terminate the tcp socket once the payload was
    // transferred and acknowledged. This setting is for the rare cases where,
    // for some reason, the tcp socket is left alive
    this.timeout = timeout;
    // See: https://github.com/nodejs/node/issues/40071
    // Leaving this without any limit will cause the server to reuse the
    // connection indefinitely (in theory). As a result, load balancing will
    // have very little effects if more instances of the server are brought up
    // by the deployment orchestration tool.
    // As for a good number, it depends on the application traffic
    this.maxRequestsPerSocket = maxRequestsPerSocket;
    this.keepAliveTimeout = keepAliveTimeout;
    this.keepAliveTimeoutBuffer = keepAliveTimeoutBuffer;

    return this;
  }

  #attachEventHandlers() {
    return this.once('error', (error) => {
      console.error('Http server error:', error);
      this.close();
    })
      .once('close', () => {
        console.info('Server shutting down...');
      })
      .on('request', this.#router.handler);
  }
}

/******************************************************************************************************/

export { HttpServer };
