import { Entity, Column } from 'typeorm';
import { SurveySchemaInterface } from '../interfaces/survey';
import { BaseEntity } from './base.entity';

// 调查配置实体
@Entity({ name: 'surveyConf' })
export class SurveyConf extends BaseEntity {
  // 代码
  @Column('jsonb')
  code: SurveySchemaInterface;

  // 页面ID
  @Column()
  pageId: string;
}
