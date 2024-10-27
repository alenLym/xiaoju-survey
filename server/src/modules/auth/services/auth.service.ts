import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { sign, verify } from 'jsonwebtoken';
import { UserService } from './user.service';

// 认证服务
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  // 生成token
  async generateToken(
    { _id, username }: { _id: string; username: string },
    { secret, expiresIn }: { secret: string; expiresIn: string },
  ) {
    // 生成token
    return sign({ _id, username }, secret, {
      expiresIn,
    });
  }

  // 验证token
  async verifyToken(token: string) {
    let decoded;
    try {
      // 验证token
      decoded = verify(
        token,
        this.configService.get<string>('XIAOJU_SURVEY_JWT_SECRET'),
      );
    } catch (err) {
      throw new Error('用户凭证错误');
    }
    // 验证用户
    const user = await this.userService.getUserByUsername(decoded.username);
    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  }
}
