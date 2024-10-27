import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthenticationException } from '../exceptions/authException';
import { AuthService } from 'src/modules/auth/services/auth.service';

// 认证守卫
@Injectable()
export class Authentication implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  // 激活
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取请求
    const request = context.switchToHttp().getRequest();
    // 获取token
    const token = request.headers.authorization?.split(' ')[1];

    // 如果token不存在，则抛出认证异常
    if (!token) {
      throw new AuthenticationException('请登录');
    }

    try {
      // 验证token
      const user = await this.authService.verifyToken(token);
      // 设置用户
      request.user = user;
      // 返回true
      return true;
    } catch (error) {
      throw new AuthenticationException(error?.message || '用户凭证错误');
    }
  }
}
