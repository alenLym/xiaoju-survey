import { Entity, Column, Index, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseEntity } from './base.entity';
// 验证码实体
@Entity({ name: 'captcha' })
export class Captcha extends BaseEntity {
  // 过期时间
  @Index({
    expireAfterSeconds:
      new Date(Date.now() + 2 * 60 * 60 * 1000).getTime() / 1000,
  })
  // 主键
  @ObjectIdColumn()
  _id: ObjectId;

  // 验证码
  @Column()
  text: string;
}
