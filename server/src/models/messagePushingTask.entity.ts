import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import {
  MESSAGE_PUSHING_TYPE,
  MESSAGE_PUSHING_HOOK,
} from 'src/enums/messagePushing';

// 消息推送任务实体
@Entity({ name: 'messagePushingTask' })
export class MessagePushingTask extends BaseEntity {
  // 名称
  @Column()
  name: string;

  // 类型
  @Column()
  type: MESSAGE_PUSHING_TYPE;

  // 推送地址
  @Column()
  pushAddress: string;

  // 触发钩子
  @Column()
  triggerHook: MESSAGE_PUSHING_HOOK;

  // 调查列表
  @Column('jsonb')
  surveys: Array<string>;

  // 创建者ID
  @Column()
  creatorId: string;

  // 拥有者ID
  @Column()
  ownerId: string;
}
