import { ApiProperty } from '@nestjs/swagger';
import Joi from 'joi';

// 聚合统计DTO
export class AggregationStatisDto {
  @ApiProperty({ description: '问卷id', required: true })
  surveyId: string;

  static validate(data) {
    return Joi.object({
      surveyId: Joi.string().required(),
    }).validate(data);
  }
}
