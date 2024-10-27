import * as log4js from 'log4js';
import moment from 'moment';
import { Request } from 'express';
const log4jsLogger = log4js.getLogger();

// 日志
export class Logger {
  private static inited = false;

  constructor() {}

  // 初始化
  static init(config: { filename: string }) {
    if (this.inited) {
      return;
    }
    // 配置日志
    log4js.configure({
      appenders: {
        app: {
          type: 'dateFile',
          filename: config.filename || './logs/app.log',
          pattern: 'yyyy-MM-dd',
          alwaysIncludePattern: true,
          numBackups: 7,
          layout: {
            type: 'pattern',
            pattern: '%m',
          },
        },
      },
      categories: {
        default: { appenders: ['app'], level: 'trace' },
      },
    });
  }

  // 日志
  _log(message, options: { dltag?: string; level: string; req?: Request }) {
    // 获取时间
    const datetime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    // 获取日志级别
    const level = options?.level;
    // 获取日志标签
    const dltag = options?.dltag ? `${options.dltag}||` : '';
    // 获取跟踪ID
    const traceIdStr = options?.req?.['traceId']
      ? `traceid=${options?.req?.['traceId']}||`
      : '';
    return log4jsLogger[level](
      `[${datetime}][${level.toUpperCase()}]${dltag}${traceIdStr}${message}`,
    );
  }

  // 信息
  info(message, options?: { dltag?: string; req?: Request }) {
    return this._log(message, { ...options, level: 'info' });
  }

  // 错误
  error(message, options: { dltag?: string; req?: Request }) {
    return this._log(message, { ...options, level: 'error' });
  }
}
