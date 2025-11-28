/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { describe, test } from 'node:test';

import { ConfigurationManager } from '../utilities/configuration.ts';

/******************************************************************************************************/

describe('Router tests', () => {
  const {
    httpServer: { baseUrl, port },
  } = new ConfigurationManager().getEnvVariables();
  const defaultFetchOptions: RequestInit = {
    keepalive: false,
    redirect: 'error',
  } as const;

  test('Non existent route', async () => {
    const fetchOptions: Parameters<typeof fetch> = [
      `${baseUrl}:${port}/${randomUUID()}`,
      { ...defaultFetchOptions, method: 'GET', signal: AbortSignal.timeout(4_000) },
    ];
    const response = await fetch(...fetchOptions);

    assert.strictEqual(response.status, 404);
  });

  test('Health check routes', async () => {
    const routes = [
      { route: 'alive', method: 'HEAD' },
      { route: 'alive', method: 'GET' },
      { route: 'ready', method: 'HEAD' },
      { route: 'ready', method: 'GET' },
    ] as const;

    await Promise.all(
      routes.map(async ({ route, method }) => {
        const fetchOptions: Parameters<typeof fetch> = [
          `${baseUrl}:${port}/${route}`,
          { ...defaultFetchOptions, method, signal: AbortSignal.timeout(4_000) },
        ];
        const response = await fetch(...fetchOptions);

        assert.ok(response);
        assert.strictEqual(response.status, 204);
      }),
    );
  });
});
