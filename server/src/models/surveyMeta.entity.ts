import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

// 调查元信息实体
@Entity({ name: 'surveyMeta' })
export class SurveyMeta extends BaseEntity {
  @Column()
  title: string;

  // 备注
  @Column()
  remark: string;

  // 调查类型
  @Column()
  surveyType: string;

  // 调查路径
  @Column()
  surveyPath: string;

  // 创建者
  @Column()
  creator: string;

  // 拥有者
  @Column()
  owner: string;

  // 拥有者ID
  @Column()
  ownerId: string;

  // 创建方式
  @Column()
  createMethod: string;

  // 创建来源
  @Column()
  createFrom: string;

  // 工作区ID
  @Column()
  workspaceId: string;
}
