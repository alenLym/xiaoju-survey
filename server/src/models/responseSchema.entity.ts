import { Entity, Column } from 'typeorm';
import { SurveySchemaInterface } from '../interfaces/survey';
import { BaseEntity } from './base.entity';

// 响应结构实体
@Entity({ name: 'surveyPublish' })
export class ResponseSchema extends BaseEntity {
  // 标题
  @Column()
  title: string;

  // 调查路径
  @Column()
  surveyPath: string;

  // 代码
  @Column('jsonb')
  code: SurveySchemaInterface;

  // 页面ID
  @Column()
  pageId: string;
}
