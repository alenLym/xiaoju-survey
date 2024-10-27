import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

// 单词实体
@Entity({ name: 'word' })
export class Word extends BaseEntity {
  // 文本
  @Column()
  text: string;

  // 类型
  @Column()
    type: string;
}
