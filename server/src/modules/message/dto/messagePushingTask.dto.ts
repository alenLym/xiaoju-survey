import { ApiProperty } from '@nestjs/swagger';

import {
  MESSAGE_PUSHING_TYPE,
  MESSAGE_PUSHING_HOOK,
} from 'src/enums/messagePushing';
import { RECORD_STATUS } from 'src/enums';

// 推送任务DTO
export class MessagePushingTaskDto {
  @ApiProperty({ description: '任务id' })
  _id: string;

  @ApiProperty({ description: '任务名称' })
  name: string;

  @ApiProperty({ description: '任务类型' })
  type: MESSAGE_PUSHING_TYPE;

  @ApiProperty({ description: '推送的http链接' })
  pushAddress: string;

  @ApiProperty({ description: '触发时机' })
  triggerHook: MESSAGE_PUSHING_HOOK;

  @ApiProperty({ description: '包含问卷id' })
  surveys: string[];

  @ApiProperty({ description: '所有者' })
  owner: string;

  @ApiProperty({ description: '任务状态', required: false })
  curStatus?: {
    status: RECORD_STATUS;
    date: number;
  };
}

// 状态码DTO
export class CodeDto {
  @ApiProperty({ description: '状态码', default: 200 })
  code: number;
}

// 任务idDTO
export class TaskIdDto {
  @ApiProperty({ description: '任务id' })
  taskId: string;
}

// 成功响应DTO
export class MessagePushingTaskSucceedResponseDto {
  @ApiProperty({ description: '状态码', default: 200 })
  code: number;

  @ApiProperty({ description: '任务详情' })
  data: MessagePushingTaskDto;
}

export class MessagePushingTaskListSucceedResponse {
  @ApiProperty({ description: '状态码', default: 200 })
  code: number;

  @ApiProperty({ description: '任务详情' })
  data: [MessagePushingTaskDto];
}
