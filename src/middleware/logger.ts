import morgan from 'morgan';
import { isDevelopment } from '../config/env';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (_req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Development format - detailed logging
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production format - more concise
const prodFormat = ':remote-addr - :method :url :status :response-time ms';

export const loggerMiddleware = isDevelopment
  ? morgan(devFormat)
  : morgan(prodFormat);
