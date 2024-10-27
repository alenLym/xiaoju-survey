import { Entity, Column } from 'typeorm';
import { HISTORY_TYPE } from '../enums';
import { SurveySchemaInterface } from '../interfaces/survey';
import { BaseEntity } from './base.entity';

// 调查历史实体
@Entity({ name: 'surveyHistory' })
export class SurveyHistory extends BaseEntity {
  // 页面ID
  @Column()
  pageId: string;

  // 类型
  @Column()
  type: HISTORY_TYPE;

  // 代码
  @Column('jsonb')
  schema: SurveySchemaInterface;

  // 操作人
  @Column('jsonb')
  operator: {
    username: string;
    _id: string;
  };
}
