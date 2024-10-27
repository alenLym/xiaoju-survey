import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

// 消息推送日志实体
@Entity({ name: 'messagePushingLog' })
export class MessagePushingLog extends BaseEntity {
  // 任务ID
  @Column()
  taskId: string;

  // 请求
  @Column('jsonb')
  request: Record<string, any>;

  // 响应
  @Column('jsonb')
  response: Record<string, any>;

  // http状态码
  @Column()
  status: number;
}
