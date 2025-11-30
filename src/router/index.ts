import type { IncomingMessage, ServerResponse } from 'node:http';

import { healthCheck } from '../entities/health-check.ts';
import { STATUS_CODES } from '../utilities/configuration.ts';
import { CustomError } from '../utilities/error.ts';

import { Router } from './router.ts';

/******************************************************************************************************/

function createRouter(baseServerUrl: string) {
  const router = new Router();

  registerHealthCheckRoutes(router, healthCheck);

  return {
    router,
    handler: async (request: IncomingMessage, response: ServerResponse) => {
      try {
        // url can be asserted due to the request object always comes from a Server instance
        const { href: url } = new URL(request.url!, baseServerUrl);
        // method can be asserted due to the request object always comes from a Server instance
        const result = router.find(url, request.method!);
        if (!result) {
          routeNotFound(url, response);
          return;
        }
        const { route, patternResult: context } = result;

        await route.handler({ request, context, response });
      } catch (error) {
        errorHandler(error, request, response);
      }
    },
  } as const;
}

/******************************************************************************************************/

function registerHealthCheckRoutes(
  router: Router,
  healthCheck: typeof import('../entities/health-check.ts').healthCheck,
) {
  return router
    .register({
      method: 'HEAD',
      pattern: { pathname: '/alive' },
      handler: healthCheck,
    })
    .register({
      method: 'GET',
      pattern: { pathname: '/alive' },
      handler: healthCheck,
    })
    .register({
      method: 'HEAD',
      pattern: { pathname: '/ready' },
      handler: healthCheck,
    })
    .register({
      method: 'GET',
      pattern: { pathname: '/ready' },
      handler: healthCheck,
    });
}

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

export { createRouter };
