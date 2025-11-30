import { globalAgent, STATUS_CODES as HTTP_STATUS_CODES } from 'node:http';
import Stream from 'node:stream';

/******************************************************************************************************/

type EnvironmentVariables = ReturnType<ConfigurationManager['getEnvVariables']>;

/******************************************************************************************************/

const REQUIRED_ENVIRONMENT_VARIABLES = [
  'HTTP_SERVER_PORT',
  'HTTP_SERVER_BASE_URL',
  'HTTP_SERVER_ROUTE',

  'HTTP_SERVER_MAX_HEADERS_COUNT',
  'HTTP_SERVER_HEADERS_TIMEOUT',
  'HTTP_SERVER_REQUEST_TIMEOUT',
  'HTTP_SERVER_TIMEOUT',
  'HTTP_SERVER_MAX_REQUESTS_PER_SOCKET',
  'HTTP_SERVER_KEEP_ALIVE_TIMEOUT',
  'HTTP_SERVER_KEEP_ALIVE_TIMEOUT_BUFFER',
  'HTTP_SERVER_FORCE_CLOSE_TIMEOUT',

  'NODE_MAX_SOCKETS',
  'NODE_MAX_TOTAL_SOCKETS',
  'NODE_DEFAULT_HIGH_WATERMARK',
  'NODE_PIPE_TIMEOUT',
] as const;

const STATUS_CODES: { [key: number]: [number, string] } = {};
Object.entries(HTTP_STATUS_CODES).forEach((entry) => {
  const code = Number(entry[0]);
  const status = entry[1]!;

  STATUS_CODES[code] = [code, status];
});

/******************************************************************************************************/

class ConfigurationManager {
  readonly #environmentVariables;

  public constructor() {
    this.#checkForMissingEnvironmentVariables();

    this.#environmentVariables = {
      httpServer: {
        port: this.#toNumber('HTTP_SERVER_PORT', process.env.HTTP_SERVER_PORT),
        baseUrl: process.env.HTTP_SERVER_BASE_URL!,
        route: process.env.HTTP_SERVER_ROUTE!,
        maxHeadersCount: this.#toNumber(
          'HTTP_SERVER_MAX_HEADERS_COUNT',
          process.env.HTTP_SERVER_MAX_HEADERS_COUNT,
        ),
        headersTimeout: this.#toNumber(
          'HTTP_SERVER_HEADERS_TIMEOUT',
          process.env.HTTP_SERVER_HEADERS_TIMEOUT,
        ),
        requestTimeout: this.#toNumber(
          'HTTP_SERVER_REQUEST_TIMEOUT',
          process.env.HTTP_SERVER_REQUEST_TIMEOUT,
        ),
        timeout: this.#toNumber('HTTP_SERVER_TIMEOUT', process.env.HTTP_SERVER_TIMEOUT),
        maxRequestsPerSocket: this.#toNumber(
          'HTTP_SERVER_MAX_REQUESTS_PER_SOCKET',
          process.env.HTTP_SERVER_MAX_REQUESTS_PER_SOCKET,
        ),
        keepAliveTimeout: this.#toNumber(
          'HTTP_SERVER_KEEP_ALIVE_TIMEOUT',
          process.env.HTTP_SERVER_KEEP_ALIVE_TIMEOUT,
        ),
        keepAliveTimeoutBuffer: this.#toNumber(
          'HTTP_SERVER_KEEP_ALIVE_TIMEOUT_BUFFER',
          process.env.HTTP_SERVER_KEEP_ALIVE_TIMEOUT_BUFFER,
        ),
        forceCloseTimeout: this.#toNumber(
          'HTTP_SERVER_FORCE_CLOSE_TIMEOUT',
          process.env.HTTP_SERVER_FORCE_CLOSE_TIMEOUT,
        ),
      },
      node: {
        pipeTimeout: this.#toNumber('NODE_PIPE_TIMEOUT', process.env.NODE_PIPE_TIMEOUT),
      },
    } as const;

    this.#setGlobalValues({
      maxSockets: this.#toNumber('NODE_MAX_SOCKETS', process.env.NODE_MAX_SOCKETS),
      maxTotalSockets: this.#toNumber('NODE_MAX_TOTAL_SOCKETS', process.env.NODE_MAX_TOTAL_SOCKETS),
      defaultHighWaterMark: this.#toNumber(
        'NODE_DEFAULT_HIGH_WATERMARK',
        process.env.NODE_DEFAULT_HIGH_WATERMARK,
      ),
    });
  }

  public getEnvVariables() {
    return this.#environmentVariables;
  }

  /****************************************************************************************************/

  #checkForMissingEnvironmentVariables() {
    const errorMessages: string[] = [];
    REQUIRED_ENVIRONMENT_VARIABLES.forEach((key) => {
      if (!process.env[key]) {
        errorMessages.push(`* Missing ${key} environment variable`);
      }
    });
    if (errorMessages.length) {
      console.error(errorMessages.join('\n'));

      process.exit(1);
    }
  }

  #toNumber(key: string, value?: string) {
    const valueAsNumber = Number(value);
    if (Number.isNaN(valueAsNumber)) {
      console.error(`Invalid value for '${key}' environment variable`);

      process.exit(1);
    }

    return valueAsNumber;
  }

  #setGlobalValues(parameters: {
    maxSockets: number;
    maxTotalSockets: number;
    defaultHighWaterMark: number;
  }) {
    const { maxSockets, maxTotalSockets, defaultHighWaterMark } = parameters;

    // See: https://nodejs.org/api/events.html#capture-rejections-of-promises
    Stream.EventEmitter.captureRejections = true;

    Stream.setDefaultHighWaterMark(false, defaultHighWaterMark);

    // To prevent DOS attacks, See: https://nodejs.org/en/learn/getting-started/security-best-practices#denial-of-service-of-http-server-cwe-400
    globalAgent.maxSockets = maxSockets;
    globalAgent.maxTotalSockets = maxTotalSockets;
  }
}

/******************************************************************************************************/

export { ConfigurationManager, STATUS_CODES, type EnvironmentVariables };
