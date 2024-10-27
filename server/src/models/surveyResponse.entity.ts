import { Entity, Column, BeforeInsert, AfterLoad } from 'typeorm';
import pluginManager from '../securityPlugin/pluginManager';
import { BaseEntity } from './base.entity';

// 调查提交实体
@Entity({ name: 'surveySubmit' })
export class SurveyResponse extends BaseEntity {
  // 页面ID
  @Column()
  pageId: string;

  // 调查路径
  @Column()
  surveyPath: string;

  // 数据
  @Column('jsonb')
  data: Record<string, any>;

  // 差异时间
  @Column()
  diffTime: number;

  // 客户端时间
  @Column()
  clientTime: number;

  // 密钥列表
  @Column('jsonb')
  secretKeys: Array<string>;

  // 选项文本和ID
  @Column('jsonb')
  optionTextAndId: Record<string, any>;

  // 插入前触发钩子
  @BeforeInsert()
  async onDataInsert() {
    return await pluginManager.triggerHook('beforeResponseDataCreate', this);
  }

  // 加载后触发钩子
  @AfterLoad()
  async onDataLoaded() {
    return await pluginManager.triggerHook('afterResponseDataReaded', this);
  }
}
