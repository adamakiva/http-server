import { PatternParser } from './path-rule.ts';

/******************************************************************************************************/

class Router {
  readonly #routes: PatternParser[];

  public constructor() {
    this.#routes = [];
  }

  public register(patternRule: ConstructorParameters<typeof PatternParser>[0]) {
    const rule = new PatternParser(patternRule);
    this.#routes.push(rule);

    return this;
  }

  public find(url: string, method: string) {
    for (const route of this.#routes) {
      const patternResult = route.match(url, method);
      if (patternResult) {
        return {
          route,
          patternResult
        } as const;
      }
    }

    return undefined;
  }
}

/******************************************************************************************************/

export { Router };
