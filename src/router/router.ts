import type { IncomingMessage, ServerResponse } from 'node:http';
import { type URLPatternOptions, URLPattern } from 'node:url';

import type { Context } from '../utilities/types.ts';

/******************************************************************************************************/

class PathRule {
  readonly #method;
  readonly #pattern;
  readonly #handler;

  public constructor(parameters: {
    method: string;
    pattern: string | URLPatternInit;
    baseUrl?: string;
    options?: URLPatternOptions;
    handler: (parameters: {
      request: IncomingMessage;
      response: ServerResponse;
      context: Context;
    }) => void | Promise<void>;
  }) {
    const { method, pattern, baseUrl, options = { ignoreCase: false }, handler } = parameters;

    this.#method = method.toUpperCase();
    if (baseUrl) {
      this.#pattern = new URLPattern(pattern, baseUrl, options);
    } else {
      this.#pattern = new URLPattern(pattern, options);
    }
    this.#handler = handler;
  }

  public match(url: string, method: string) {
    if (method.toUpperCase() !== this.#method) {
      return undefined;
    }
    if (!this.#pattern.test(url)) {
      return undefined;
    }

    const result = this.#pattern.exec(url);
    if (!result) {
      return undefined;
    }

    return {
      protocol: result.protocol.groups,
      username: result.username.groups,
      password: result.password.groups,
      hostname: result.hostname.groups,
      port: result.port.groups,
      pathname: result.pathname.groups,
      search: result.search.groups,
      hash: result.hash.groups,
    } as const;
  }

  public get handler() {
    return this.#handler;
  }
}

class Router {
  readonly #routes: PathRule[];

  public constructor() {
    this.#routes = [];
  }

  public register(patternRule: ConstructorParameters<typeof PathRule>[0]) {
    const rule = new PathRule(patternRule);
    this.#routes.push(rule);

    return this;
  }

  public find(url: string, method: string) {
    for (const route of this.#routes) {
      const patternResult = route.match(url, method);
      if (patternResult) {
        return {
          route,
          patternResult,
        } as const;
      }
    }

    return undefined;
  }
}

/******************************************************************************************************/

export { Router };
