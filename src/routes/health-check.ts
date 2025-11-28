import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Context } from '../router/path-rule.ts';
import { STATUS_CODES } from '../utilities/constants.ts';

/******************************************************************************************************/

function healthCheck(parameters: {
  request: IncomingMessage;
  context: Context;
  response: ServerResponse;
}) {
  const { response } = parameters;

  response
    .writeHead(...STATUS_CODES[204]!, {
      'content-length': 0,
      'content-type': 'text/plain',
    })
    .end();
}

/******************************************************************************************************/

export { healthCheck };
