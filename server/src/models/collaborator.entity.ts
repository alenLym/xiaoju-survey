import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

// 协作者实体
@Entity({ name: 'collaborator' })
export class Collaborator extends BaseEntity {
  // 调查ID
  @Column()
  surveyId: string;

  // 用户ID
  @Column()
  userId: string;

  // 权限列表
  @Column('jsonb')
  permissions: Array<string>;
}
