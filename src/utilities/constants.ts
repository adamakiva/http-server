import { STATUS_CODES as HTTP_STATUS_CODES } from 'node:http';

/******************************************************************************************************/

const STATUS_CODES: { [key: number]: [number, string] } = {};
Object.entries(HTTP_STATUS_CODES).forEach((entry) => {
  const code = Number(entry[0]);
  const status = entry[1]!;

  STATUS_CODES[code] = [code, status];
});

/******************************************************************************************************/

export { STATUS_CODES };
