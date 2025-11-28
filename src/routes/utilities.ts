import type { IncomingMessage, ServerResponse } from 'node:http';

import { STATUS_CODES } from '../utilities/constants.ts';
import { CustomError } from '../utilities/error.ts';

/******************************************************************************************************/

function routeNotFound(url: string, response: ServerResponse) {
  const message = [`Route ${url} does not exist on the server`, 'utf8'] as const;

  response
    .writeHead(...STATUS_CODES[404]!, {
      'content-length': Buffer.byteLength(...message),
      'content-type': 'text/plain',
    })
    .end(...message);
}

function errorHandler(error: unknown, request: IncomingMessage, response: ServerResponse) {
  let statusCode = 500;
  let message = ['Unexpected error', 'utf8'] as [string, 'utf8'];
  if (Error.isError(error)) {
    message = [error.message, 'utf8'] as const;
    if (error instanceof CustomError) {
      statusCode = error.getStatusCode();
    }
  }

  console.error(`[${request.method!} Request to ${request.url!} failed]:`, error);

  response
    .writeHead(...STATUS_CODES[statusCode]!, {
      'content-length': Buffer.byteLength(...message),
      'content-type': 'text/plain',
    })
    .end(...message);
}

/******************************************************************************************************/

export { errorHandler, routeNotFound };
