import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpException } from './httpException';

// http异常过滤器
@Catch(Error)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    // 获取请求
    const ctx = host.switchToHttp();
    // 获取响应
    const response = ctx.getResponse<Response>();

    // 设置状态码、消息、错误码
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let code = 500;

    // 如果异常是HttpException
    if (exception instanceof HttpException) {
      status = HttpStatus.OK; // 非系统报错状态码为200
      message = exception.message;
      code = exception.code;
    }

    // 返回响应
    response.status(status).json({
      message,
      code,
      errmsg: exception.message,
    });
  }
}
