import { Provider } from '@nestjs/common';

import { Logger } from './index';

// 日志提供者
export const LoggerProvider: Provider = {
  provide: Logger,
  useClass: Logger,
};
