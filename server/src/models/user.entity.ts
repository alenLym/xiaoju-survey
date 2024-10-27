import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

// 用户实体
@Entity({ name: 'user' })
export class User extends BaseEntity {
  // 用户名
  @Column()
  username: string;

  // 密码
  @Column()
  password: string;
}
