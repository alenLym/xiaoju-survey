// nestjs
import { MiddlewareConsumer, Module } from '@nestjs/common';

// app
import { AppController } from './app.controller';

// plugins
import { ResponseSecurityPlugin } from './securityPlugin/responseSecurityPlugin';
import { SurveyUtilPlugin } from './securityPlugin/surveyUtilPlugin';

// nestjs
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

// modules
import { SurveyModule } from './modules/survey/survey.module';
import { SurveyResponseModule } from './modules/surveyResponse/surveyResponse.module';
import { AuthModule } from './modules/auth/auth.module';
import { MessageModule } from './modules/message/message.module';
import { FileModule } from './modules/file/file.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';

import { join } from 'path';

// nestjs
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionsFilter } from './exceptions/httpExceptions.filter';

// entities
import { Captcha } from './models/captcha.entity';
import { User } from './models/user.entity';
import { SurveyMeta } from './models/surveyMeta.entity';
import { SurveyConf } from './models/surveyConf.entity';
import { SurveyHistory } from './models/surveyHistory.entity';
import { ResponseSchema } from './models/responseSchema.entity';
import { Counter } from './models/counter.entity';
import { SurveyResponse } from './models/surveyResponse.entity';
import { ClientEncrypt } from './models/clientEncrypt.entity';
import { Word } from './models/word.entity';
import { MessagePushingTask } from './models/messagePushingTask.entity';
import { MessagePushingLog } from './models/messagePushingLog.entity';
import { WorkspaceMember } from './models/workspaceMember.entity';
import { Workspace } from './models/workspace.entity';
import { Collaborator } from './models/collaborator.entity';

// providers
import { LoggerProvider } from './logger/logger.provider';
// plugins
import { PluginManagerProvider } from './securityPlugin/pluginManager.provider';
// middlewares
import { LogRequestMiddleware } from './middlewares/logRequest.middleware';
// plugins
import { XiaojuSurveyPluginManager } from './securityPlugin/pluginManager';
// logger
import { Logger } from './logger';

@Module({
  imports: [
    // 配置环境变量
    ConfigModule.forRoot({}),
    // 配置数据库
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // 获取配置
        const url = await configService.get<string>('XIAOJU_SURVEY_MONGO_URL');
        // 获取认证源
        const authSource =
          (await configService.get<string>(
            'XIAOJU_SURVEY_MONGO_AUTH_SOURCE',
          )) || 'admin';
        // 获取数据库名称
        const database = await configService.get<string>(
          'XIAOJU_SURVEY_MONGO_DB_NAME',
        );
        // 返回配置
        return {
          // 数据库类型
          type: 'mongodb',
          // 连接超时时间
          connectTimeoutMS: 10000,
          // 套接字超时时间
          socketTimeoutMS: 10000,
          // 连接URL
          url,
          // 认证源
          authSource,
          // 使用新的URL解析器
          useNewUrlParser: true,
          // 数据库名称
          database,
          // 实体
          entities: [
            Captcha,
            User,
            SurveyMeta,
            SurveyConf,
            SurveyHistory,
            SurveyResponse,
            Counter,
            ResponseSchema,
            ClientEncrypt,
            Word,
            MessagePushingTask,
            MessagePushingLog,
            Workspace,
            WorkspaceMember,
            Collaborator,
          ],
        };
      },
    }),
    // 认证模块
    AuthModule,
    // 调查模块
    SurveyModule,
    // 调查响应模块
    SurveyResponseModule,
    // 静态文件模块
    ServeStaticModule.forRootAsync({

      useFactory: async () => {
        return [
          {
            rootPath: join(__dirname, '..', 'public'),
          },
        ];
      },
    }),
    // 消息模块
    MessageModule,
    // 文件模块
    FileModule,
    // 空间模块
    WorkspaceModule,
  ],
  controllers: [AppController],
  providers: [
    // 全局过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
    // 日志提供者
    LoggerProvider,
    // 插件管理器提供者
    PluginManagerProvider,
  ],
})
export class AppModule {
  constructor(
    private readonly configService: ConfigService,
    private readonly pluginManager: XiaojuSurveyPluginManager,
  ) {}
  // 中间件
  configure(consumer: MiddlewareConsumer) {
    // 注册日志中间件
    consumer.apply(LogRequestMiddleware).forRoutes('*');
  }
  // 模块初始化
  onModuleInit() {
    // 注册插件
    this.pluginManager.registerPlugin(
      new ResponseSecurityPlugin(
        this.configService.get<string>(
          'XIAOJU_SURVEY_RESPONSE_AES_ENCRYPT_SECRET_KEY',
        ),
      ),
      new SurveyUtilPlugin(),
    );
    // 初始化日志
    Logger.init({
      filename: this.configService.get<string>('XIAOJU_SURVEY_LOGGER_FILENAME'),
    });
  }
}
