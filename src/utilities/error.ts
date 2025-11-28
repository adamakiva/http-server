import { inspect } from 'node:util';

/******************************************************************************************************/

class CustomError extends Error {
  readonly #statusCode;

  public constructor(statusCode: number, message: string, cause?: unknown) {
    super(message);

    this.name = 'CustomError';
    this.cause = cause;
    this.#statusCode = statusCode;
  }

  public override toString() {
    const stackTrace = this.stack
      ? `\nStack trace:\n${this.stack.split('\n').slice(1).join('\n')}`
      : '';

    let logMessage = `${this.message}\n${stackTrace}\n`;
    if (Error.isError(this.cause)) {
      logMessage += `\nCause:\n${this.#formatError(this.cause)}`;
    }

    return logMessage;
  }

  public [inspect.custom]() {
    return this.toString();
  }

  public getStatusCode() {
    return this.#statusCode;
  }

  /********************************************************************************/

  #formatError(error: Error) {
    const header = `${error.name} - ${error.message}`;
    const stackTrace = error.stack
      ? `\nStack trace:\n${error.stack.split('\n').slice(1).join('\n')}`
      : '';
    // The function must have a return type to allow tsc to evaluate the recursion
    // correctly. See: https://github.com/microsoft/TypeScript/issues/43047
    const nestedCause: string = Error.isError(error.cause)
      ? `\n[cause]: ${this.#formatError(error.cause)}`
      : '';

    const formattedError = `${header}${stackTrace}${nestedCause}`;

    return formattedError;
  }
}

/******************************************************************************************************/

export { CustomError };
