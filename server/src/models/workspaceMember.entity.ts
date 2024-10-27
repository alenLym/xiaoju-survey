import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

// 工作区成员实体
@Entity({ name: 'workspaceMember' })
export class WorkspaceMember extends BaseEntity {
  // 用户ID
  @Column()
  userId: string;

  // 工作区ID
  @Column()
  workspaceId: string;

  // 角色
  @Column()
  role: string;
}
