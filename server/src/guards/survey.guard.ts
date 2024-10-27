import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { get } from 'lodash';

import { WorkspaceMemberService } from 'src/modules/workspace/services/workspaceMember.service';

import { CollaboratorService } from 'src/modules/survey/services/collaborator.service';
import { SurveyMetaService } from 'src/modules/survey/services/surveyMeta.service';
import { SurveyNotFoundException } from 'src/exceptions/surveyNotFoundException';
import { NoPermissionException } from 'src/exceptions/noPermissionException';
// 问卷守卫
@Injectable()
export class SurveyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly collaboratorService: CollaboratorService,
    private readonly surveyMetaService: SurveyMetaService,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  // 激活
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取请求
    const request = context.switchToHttp().getRequest();
    // 获取用户
    const user = request.user;
    // 获取问卷ID
    const surveyIdKey = this.reflector.get<string>(
      'surveyId',
      context.getHandler(),
    );

    // 获取问卷ID
    const surveyId = get(request, surveyIdKey);

    // 如果问卷ID不存在，则返回true
    if (!surveyId) {
      return true;
    }

    // 获取问卷元信息
    const surveyMeta = await this.surveyMetaService.getSurveyById({ surveyId });

    // 如果问卷元信息不存在，则抛出问卷不存在异常
    if (!surveyMeta) {
      throw new SurveyNotFoundException('问卷不存在');
    }

    request.surveyMeta = surveyMeta;

      // 兼容老的问卷没有ownerId
    if (
      surveyMeta.ownerId === user._id.toString() ||
      surveyMeta.owner === user.username
    ) {
      // 问卷的owner，可以访问和操作问卷
      return true;
    }

    if (surveyMeta.workspaceId) {
      const memberInfo = await this.workspaceMemberService.findOne({
        workspaceId: surveyMeta.workspaceId,
        userId: user._id.toString(),
      });
      if (!memberInfo) {
        throw new NoPermissionException('没有权限');
      }
      return true;
    }

    // 获取问卷权限
    const permissions = this.reflector.get<string[]>(
      'surveyPermission',
      context.getHandler(),
    );

    // 如果权限不存在，则抛出没有权限异常
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new NoPermissionException('没有权限');
    }

    // 获取协作信息
    const info = await this.collaboratorService.getCollaborator({
      surveyId,
      userId: user._id.toString(),
    });

    // 如果协作信息不存在，则抛出没有权限异常
    if (!info) {
      throw new NoPermissionException('没有权限');
    }
    // 设置协作信息
    request.collaborator = info;
    // 如果权限包含在协作信息中，则返回true
    if (
      permissions.some((permission) => info.permissions.includes(permission))
    ) {
      return true;
    }
    // 如果没有权限，则抛出没有权限异常
    throw new NoPermissionException('没有权限');
  }
}
