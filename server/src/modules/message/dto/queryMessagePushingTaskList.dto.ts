import { ApiProperty } from '@nestjs/swagger';
import Joi from 'joi';
import { MESSAGE_PUSHING_HOOK } from 'src/enums/messagePushing';

// 查询推送任务列表DTO
export class QueryMessagePushingTaskListDto {
  @ApiProperty({ description: '问卷id', required: false })
  surveyId?: string;

  @ApiProperty({ description: 'hook名称', required: false })
  triggerHook?: MESSAGE_PUSHING_HOOK;

  // 验证参数
  static validate(data) {
    return Joi.object({
      surveyId: Joi.string().required(),
      triggerHook: Joi.string().required(),
    }).validate(data);
  }
}
