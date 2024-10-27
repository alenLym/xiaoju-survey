import { ApiProperty } from '@nestjs/swagger';
import Joi from 'joi';

// 获取用户列表DTO
export class GetUserListDto {
  // 用户名
  @ApiProperty({ description: '用户名', required: true })
  username: string;

  // 页码
  @ApiProperty({ description: '页码', required: false, default: 1 })
  pageIndex?: number;

  // 每页查询数
  @ApiProperty({ description: '每页查询数', required: false, default: 10 })
  pageSize: number;

  // 验证参数
  static validate(data) {
    return Joi.object({
      username: Joi.string().required(),
      pageIndex: Joi.number().allow(null).default(1),
      pageSize: Joi.number().allow(null).default(10),
    }).validate(data);
  }
}
