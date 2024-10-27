import { ApiProperty } from '@nestjs/swagger';
import Joi from 'joi';

// 获取协作者列表DTO
export class GetSurveyCollaboratorListDto {
  @ApiProperty({ description: '问卷id', required: true })
  surveyId: string;

  static validate(data) {
    return Joi.object({
      surveyId: Joi.string().required(),
    }).validate(data);
  }
}
