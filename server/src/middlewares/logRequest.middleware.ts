// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logger/index'; // 替换为你实际的logger路径
import { genTraceId } from '../logger/util';

// 日志请求中间件
@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}
  // 使用中间件
  use(req: Request, res: Response, next: NextFunction) {
    // 获取请求信息
    const { method, originalUrl, ip } = req;
    // 获取用户代理
    const userAgent = req.get('user-agent') || '';
    // 获取开始时间
    const startTime = Date.now();
    // 生成traceId
    const traceId = genTraceId({ ip });
    // 设置traceId
    req['traceId'] = traceId;
    // 获取查询参数
    const query = JSON.stringify(req.query);
    // 获取请求体
    const body = JSON.stringify(req.body);
    // 记录日志
    this.logger.info(
      `method=${method}||uri=${originalUrl}||ip=${ip}||ua=${userAgent}||query=${query}||body=${body}`,
      {
        dltag: 'request_in',
        req,
      },
    );

    // 记录响应日志
    res.once('finish', () => {
      // 获取响应时间
      const duration = Date.now() - startTime;
      // 记录响应日志
      this.logger.info(
        `status=${res.statusCode.toString()}||duration=${duration}ms`,
        {
          dltag: 'request_out',
          req,
        },
      );
    });

    next();
  }
}
