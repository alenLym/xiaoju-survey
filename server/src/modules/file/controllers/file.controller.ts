import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Request,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

import { FileService } from '../services/file.service';
import { HttpException } from 'src/exceptions/httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { AuthenticationException } from 'src/exceptions/authException';

// 文件控制器
@ApiTags('file')
@Controller('/api/file')
export class FileController {
  constructor(
    // 文件服务
    private readonly fileService: FileService,
    // 认证服务
    private readonly authService: AuthService,
    // 配置服务
    private readonly configService: ConfigService,
  ) {}

  // 上传文件
  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body() reqBody,
  ) {
    const { channel } = reqBody;

    // 如果渠道不存在，则抛出参数错误异常
    if (!channel || !this.configService.get<string>(channel)) {
      throw new HttpException(
        `参数有误channel不正确:${reqBody.channel}`,
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }
    // 获取配置
    const configKey = this.configService.get<string>(channel);
    // 获取是否需要认证
    const needAuth = this.configService.get<boolean>(`${configKey}.NEED_AUTH`);
    // 如果需要认证
    if (needAuth) {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new AuthenticationException('请登录');
      }
      await this.authService.verifyToken(token);
    }
    // 获取文件key前缀
    const fileKeyPrefix = this.configService.get<string>(
      `${configKey}.FILE_KEY_PREFIX`,
    );

    // 上传文件
    const { key, url } = await this.fileService.upload({
      configKey,
      file,
      pathPrefix: fileKeyPrefix,
    });
    return {
      code: 200,
      data: {
        url,
        key,
      },
    };
  }

  // 生成文件URL
  @Post('getUrl')
  @HttpCode(200)
  async generateGetUrl(@Body() reqBody) {
    const { channel, key } = reqBody;
    if (!channel || !key || !this.configService.get<string>(channel)) {
      throw new HttpException(
        '参数有误，请检查channel、key',
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }
    // 获取配置
    const configKey = this.configService.get<string>(channel);
    // 获取文件URL
    const url = this.fileService.getUrl({ configKey, key });
    return {
      code: 200,
      data: {
        key,
        url,
      },
    };
  }
}
