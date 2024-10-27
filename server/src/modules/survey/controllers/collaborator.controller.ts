import {
  // 导入Body装饰器
  Body,
  // 导入Controller装饰器
  Controller,
  // 导入Get装饰器
  Get,
  // 导入HttpCode装饰器
  HttpCode,
  // 导入Post装饰器
  Post,
  // 导入Query装饰器
  Query,
  // 导入Request装饰器
  Request,
  // 导入SetMetadata装饰器
  SetMetadata,
  // 导入UseGuards装饰器
  UseGuards,
} from '@nestjs/common';
// 导入ApiTags装饰器
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
// 导入Joi库
import * as Joi from 'joi';

// 导入Authentication守卫
import { Authentication } from 'src/guards/authentication.guard';
// 导入HttpException
import { HttpException } from 'src/exceptions/httpException';
// 导入EXCEPTION_CODE
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
// 导入SurveyGuard守卫
import { SurveyGuard } from 'src/guards/survey.guard';
// 导入SURVEY_PERMISSION和SURVEY_PERMISSION_DESCRIPTION
import {
  SURVEY_PERMISSION,
  SURVEY_PERMISSION_DESCRIPTION,
} from 'src/enums/surveyPermission';
// 导入Logger
import { Logger } from 'src/logger';
// 导入WorkspaceMemberService
import { WorkspaceMemberService } from 'src/modules/workspace/services/workspaceMember.service';
// 导入CollaboratorService
import { CollaboratorService } from '../services/collaborator.service';
// 导入UserService
import { UserService } from 'src/modules/auth/services/user.service';
// 导入CreateCollaboratorDto
import { CreateCollaboratorDto } from '../dto/createCollaborator.dto';
// 导入ChangeUserPermissionDto
import { ChangeUserPermissionDto } from '../dto/changeUserPermission.dto';
// 导入GetSurveyCollaboratorListDto
import { GetSurveyCollaboratorListDto } from '../dto/getSurveyCollaboratorList.dto';
// 导入BatchSaveCollaboratorDto
import { BatchSaveCollaboratorDto } from '../dto/batchSaveCollaborator.dto';
// 导入splitCollaborators
import { splitCollaborators } from '../utils/splitCollaborator';
// 导入SurveyMetaService
import { SurveyMetaService } from '../services/surveyMeta.service';

// 使用Authentication守卫
@UseGuards(Authentication)
// 使用ApiTags装饰器
@ApiTags('collaborator')
// 使用ApiBearerAuth装饰器
@ApiBearerAuth()
// 使用Controller装饰器
@Controller('/api/collaborator')
export class CollaboratorController {
  constructor(
    // 注入CollaboratorService
    private readonly collaboratorService: CollaboratorService,
    // 注入Logger
    private readonly logger: Logger,
    // 注入UserService
    private readonly userService: UserService,
    // 注入SurveyMetaService
    private readonly surveyMetaService: SurveyMetaService,
    // 注入WorkspaceMemberService
    private readonly workspaceMemberServie: WorkspaceMemberService,
  ) {}

  // 获取权限列表
  @Get('getPermissionList')
  @HttpCode(200)
  async getPermissionList() {
    const vals = Object.values(SURVEY_PERMISSION_DESCRIPTION);
    return {
      code: 200,
      data: vals,
    };
    }

  // 添加协作者
  @Post('')
  @HttpCode(200)
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'body.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async addCollaborator(
    @Body() reqBody: CreateCollaboratorDto,
    @Request() req,
  ) {
    const { error, value } = CreateCollaboratorDto.validate(reqBody);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException(
        '系统错误，请联系管理员',
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }

    // 检查用户是否存在
    const user = await this.userService.getUserById(value.userId);
    if (!user) {
      throw new HttpException('用户不存在', EXCEPTION_CODE.USER_NOT_EXISTS);
    }

    if (user._id.toString() === req.surveyMeta.ownerId) {
      throw new HttpException(
        '不能给问卷所有者授权',
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }

    const collaborator = await this.collaboratorService.getCollaborator({
      userId: value.userId,
      surveyId: value.surveyId,
    });

    if (collaborator) {
      throw new HttpException(
        '用户已经是协作者',
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }

    const res = await this.collaboratorService.create(value);

    return {
      code: 200,
      data: {
        collaboratorId: res._id.toString(),
      },
    };
  }

  // 批量保存协作者
  @Post('batchSave')
  @HttpCode(200)
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'body.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async batchSaveCollaborator(
    @Body() reqBody: BatchSaveCollaboratorDto,
    @Request() req,
  ) {
    const { error, value } = BatchSaveCollaboratorDto.validate(reqBody);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException(
        '系统错误，请联系管理员',
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }

    if (Array.isArray(value.collaborators) && value.collaborators.length > 0) {
      const collaboratorUserIdList = value.collaborators.map(
        (item) => item.userId,
      );
      for (const collaboratorUserId of collaboratorUserIdList) {
        if (collaboratorUserId === req.surveyMeta.ownerId) {
          throw new HttpException(
            '不能给问卷所有者授权',
            EXCEPTION_CODE.PARAMETER_ERROR,
          );
        }
      }
      // 不能有重复的userId
      const userIdSet = new Set(collaboratorUserIdList);
      if (collaboratorUserIdList.length !== Array.from(userIdSet).length) {
        throw new HttpException(
          '不能重复添加用户',
          EXCEPTION_CODE.PARAMETER_ERROR,
        );
      }
      const userList = await this.userService.getUserListByIds({
        idList: collaboratorUserIdList,
      });
      const userInfoMap = userList.reduce((pre, cur) => {
        const id = cur._id.toString();
        pre[id] = cur;
        return pre;
      }, {});

      for (const collaborator of value.collaborators) {
        if (!userInfoMap[collaborator.userId]) {
          throw new HttpException(
            `用户id: {${collaborator.userId}} 不存在`,
            EXCEPTION_CODE.PARAMETER_ERROR,
          );
        }
      }
    }

    if (Array.isArray(value.collaborators) && value.collaborators.length > 0) {
      const { newCollaborator, existsCollaborator } = splitCollaborators(
        value.collaborators,
      );
      const collaboratorIdList = existsCollaborator.map((item) => item._id);
      const newCollaboratorUserIdList = newCollaborator.map(
        (item) => item.userId,
      );
      const delRes = await this.collaboratorService.batchDelete({
        surveyId: value.surveyId,
        idList: [],
        neIdList: collaboratorIdList,
        userIdList: newCollaboratorUserIdList,
      });
      this.logger.info('batchDelete:' + JSON.stringify(delRes), { req });
      if (Array.isArray(newCollaborator) && newCollaborator.length > 0) {
        const insertRes = await this.collaboratorService.batchCreate({
          surveyId: value.surveyId,
          collaboratorList: newCollaborator,
        });
        this.logger.info(`${JSON.stringify(insertRes)}`);
      }
      if (Array.isArray(existsCollaborator) && existsCollaborator.length > 0) {
        const updateRes = await Promise.all(
          existsCollaborator.map((item) =>
            this.collaboratorService.updateById({
              collaboratorId: item._id,
              permissions: item.permissions,
            }),
          ),
        );
        this.logger.info(`${JSON.stringify(updateRes)}`);
      }
    } else {
      // 删除所有协作者
      const delRes = await this.collaboratorService.batchDeleteBySurveyId(
        value.surveyId,
      );
      this.logger.info(JSON.stringify(delRes), { req });
    }

    return {
      code: 200,
    };
  }

  // 获取协作者列表
  @Get('')
  @HttpCode(200)
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'query.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async getSurveyCollaboratorList(
    @Query() query: GetSurveyCollaboratorListDto,
    @Request() req,
  ) {
    const { error, value } = GetSurveyCollaboratorListDto.validate(query);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    const res = await this.collaboratorService.getSurveyCollaboratorList(value);

    const userIdList = res.map((item) => item.userId);
    const userList = await this.userService.getUserListByIds({
      idList: userIdList,
    });
    const userInfoMap = userList.reduce((pre, cur) => {
      const id = cur._id.toString();
      pre[id] = cur;
      return pre;
    }, {});

    return {
      code: 200,
      data: res.map((item) => {
        return {
          ...item,
          username: userInfoMap[item.userId]?.username || '',
        };
      }),
    };
  }

  // 修改用户权限
  @Post('changeUserPermission')
  @HttpCode(200)
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'body.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async changeUserPermission(
    @Body() reqBody: ChangeUserPermissionDto,
    @Request() req,
  ) {
    const { error, value } = Joi.object({
      surveyId: Joi.string(),
      userId: Joi.string(),
      permissions: Joi.array().items(Joi.string().required()),
    }).validate(reqBody);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    const res = await this.collaboratorService.changeUserPermission(value);

    return {
      code: 200,
      data: res,
    };
  }

  // 删除协作者
  @Post('deleteCollaborator')
  @HttpCode(200)
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'body.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async deleteCollaborator(@Query() query, @Request() req) {
    const { error, value } = Joi.object({
      surveyId: Joi.string(),
      userId: Joi.string(),
    }).validate(query);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    const res = await this.collaboratorService.deleteCollaborator(value);

    return {
      code: 200,
      data: res,
    };
  }

  // 获取用户问卷权限
  @HttpCode(200)
  @Get('permissions')
  async getUserSurveyPermissions(@Request() req, @Query() query) {
    const user = req.user;
    const userId = user._id.toString();
    const surveyId = query.surveyId;
    const surveyMeta = await this.surveyMetaService.getSurveyById({ surveyId });

    if (!surveyMeta) {
      this.logger.error(`问卷不存在: ${surveyId}`, { req });
      throw new HttpException('问卷不存在', EXCEPTION_CODE.SURVEY_NOT_FOUND);
    }

    // 问卷owner，有问卷的权限
    if (
      surveyMeta?.ownerId === userId ||
      surveyMeta?.owner === req.user.username
    ) {
      return {
        code: 200,
        data: {
          isOwner: true,
          permissions: [
            SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
            SURVEY_PERMISSION.SURVEY_RESPONSE_MANAGE,
            SURVEY_PERMISSION.SURVEY_CONF_MANAGE,
          ],
        },
      };
    }
    // 有空间权限，默认也有所有权限
    if (surveyMeta.workspaceId) {
      const memberInfo = await this.workspaceMemberServie.findOne({
        workspaceId: surveyMeta.workspaceId,
        userId,
      });
      if (memberInfo) {
        return {
          code: 200,
          data: {
            isOwner: false,
            permissions: [
              SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
              SURVEY_PERMISSION.SURVEY_RESPONSE_MANAGE,
              SURVEY_PERMISSION.SURVEY_CONF_MANAGE,
            ],
          },
        };
      }
    }

    const colloborator = await this.collaboratorService.getCollaborator({
      surveyId,
      userId,
    });
    return {
      code: 200,
      data: {
        isOwner: false,
        permissions: colloborator?.permissions || [],
      },
    };
  }
}
