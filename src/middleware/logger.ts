import morgan from 'morgan';
import { isDevelopment } from '../config/env';

// Development format - detailed logging
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production format - more concise
const prodFormat = ':remote-addr - :method :url :status :response-time ms';

export const loggerMiddleware = isDevelopment
  ? morgan(devFormat)
  : morgan(prodFormat);
