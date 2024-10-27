import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

// 工作区实体
@Entity({ name: 'workspace' })
export class Workspace extends BaseEntity {
  // 拥有者ID
  @Column()
  ownerId: string;

  // 名称
  @Column()
  name: string;

  // 描述
  @Column()
  description: string;
}
