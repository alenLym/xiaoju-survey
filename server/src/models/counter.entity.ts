import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

// 计数器实体
@Entity({ name: 'counter' })
export class Counter extends BaseEntity {
  // 键
  @Column()
  key: string;

  // 调查路径
  @Column()
  surveyPath: string;

  // 类型
  @Column()
  type: string;

  // 数据
  @Column('jsonb')
  data: Record<string, any>;
}
