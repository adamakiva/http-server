type Context = {
  [key in keyof Omit<URLPatternResult, 'inputs'>]: { [key: string]: string | undefined };
};

/******************************************************************************************************/

export type { Context };
