// 模块装饰器
import { Module } from '@nestjs/common';
// 用户服务
import { UserService } from './services/user.service';
// 认证服务
import { AuthService } from './services/auth.service';
// 验证码服务
import { CaptchaService } from './services/captcha.service';

// 认证控制器
import { AuthController } from './controllers/auth.controller';
// 用户控制器
import { UserController } from './controllers/user.controller';

// 用户实体
import { User } from 'src/models/user.entity';
// 验证码实体
import { Captcha } from 'src/models/captcha.entity';
// 类型ORM模块
import { TypeOrmModule } from '@nestjs/typeorm';
// 配置模块
import { ConfigModule } from '@nestjs/config';

// 认证模块
@Module({
  // 导入实体
  imports: [TypeOrmModule.forFeature([User, Captcha]), ConfigModule],
  // 控制器
  controllers: [AuthController, UserController],
  // 提供者
  providers: [UserService, AuthService, CaptchaService],
  // 导出
  exports: [UserService, AuthService],
})
// 认证模块
export class AuthModule {}
