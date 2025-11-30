import type { IncomingMessage, ServerResponse } from 'node:http';

import { STATUS_CODES } from '../utilities/configuration.ts';
import type { Context } from '../utilities/types.ts';

/******************************************************************************************************/

function healthCheck(parameters: {
  request: IncomingMessage;
  response: ServerResponse;
  context: Context;
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
