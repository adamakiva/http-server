import type { IncomingMessage, ServerResponse } from 'node:http';

import { Router } from '../router/index.ts';

import { healthCheck } from './health-check.ts';
import { errorHandler, routeNotFound } from './utilities.ts';

/******************************************************************************************************/

function createRouter(baseServerUrl: string) {
  const router = new Router();

  router
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

export { createRouter };
