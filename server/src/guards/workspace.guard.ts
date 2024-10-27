import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { get } from 'lodash';

import { NoPermissionException } from '../exceptions/noPermissionException';

import { WorkspaceMemberService } from 'src/modules/workspace/services/workspaceMember.service';
import { ROLE_PERMISSION as WORKSPACE_ROLE_PERMISSION } from 'src/enums/workspace';

// 空间守卫
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}
  // 激活
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取权限
    const allowPermissions = this.reflector.get<string[]>(
      'workspacePermissions',
      context.getHandler(),
    );

    if (!allowPermissions) {
      return true; // 没有定义权限，可以访问
    }

    // 获取请求
    const request = context.switchToHttp().getRequest();
    // 获取用户
    const user = request.user;
    // 获取空间ID信息
    const workspaceIdInfo = this.reflector.get(
      'workspaceId',
      context.getHandler(),
    );
    // 设置空间ID和可选
    let workspaceIdKey, optional;
    // 如果空间ID信息是字符串
    if (typeof workspaceIdInfo === 'string') {
      workspaceIdKey = workspaceIdInfo;
      optional = false;
    } else {
      workspaceIdKey = workspaceIdInfo?.key;
      optional = workspaceIdInfo?.optional || false;
    }

    // 获取空间ID
    const workspaceId = get(request, workspaceIdKey);

    // 如果空间ID不存在，且可选为false，则抛出没有空间权限异常
    if (!workspaceId && optional === false) {
      throw new NoPermissionException('没有空间权限');
    }

    // 如果空间ID存在
    if (workspaceId) {
      // 获取空间成员信息
      const membersInfo = await this.workspaceMemberService.findOne({
        workspaceId,
        userId: user._id.toString(),
      });

      // 如果空间成员信息不存在，则抛出没有空间权限异常
      if (!membersInfo) {
        throw new NoPermissionException('没有空间权限');
      }

      // 获取用户权限
      const userPermissions = WORKSPACE_ROLE_PERMISSION[membersInfo.role] || [];
      // 如果权限包含在用户权限中，则返回true
      if (
        allowPermissions.some((permission) =>
          userPermissions.includes(permission),
        )
      ) {
        return true;
      }
      // 如果没有权限，则抛出没有权限异常
      throw new NoPermissionException('没有权限');
    }
    // 返回true
    return true;
  }
}
