import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { WorkspaceMember } from 'src/models/workspaceMember.entity';
import { ObjectId } from 'mongodb';
import { RECORD_STATUS } from 'src/enums';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: MongoRepository<WorkspaceMember>,
  ) {}

  // 创建成员
  async create(member: {
    role: string;
    userId: string;
    workspaceId: string;
  }): Promise<WorkspaceMember> {
    const newMember = this.workspaceMemberRepository.create(member);
    return this.workspaceMemberRepository.save(newMember);
  }

  // 批量创建成员
  async batchCreate({
    workspaceId,
    members,
  }: {
    workspaceId: string;
    members: Array<{ userId: string; role: string }>;
  }) {
    if (members.length === 0) {
      return {
        insertedCount: 0,
      };
    }
    const dataToInsert = members.map((item) => {
      return {
        ...item,
        workspaceId,
      };
    });
    return this.workspaceMemberRepository.insertMany(dataToInsert);
  }

  // 批量更新成员角色
  async batchUpdate({ idList, role }: { idList: Array<string>; role: string }) {
    if (idList.length === 0) {
      return {
        modifiedCount: 0,
      };
    }
    return this.workspaceMemberRepository.updateMany(
      {
        _id: {
          $in: idList.map((item) => new ObjectId(item)),
        },
      },
      {
        $set: {
          role,
        },
      },
    );
  }

  // 批量删除成员
  async batchDelete({
    idList,
    neIdList,
  }: {
    idList: Array<string>;
    neIdList: Array<string>;
  }) {
    if (idList.length === 0 || neIdList.length === 0) {
      return {
        modifiedCount: 0,
      };
    }
    return this.workspaceMemberRepository.deleteMany({
      _id: {
        $in: idList.map((item) => new ObjectId(item)),
        $nin: neIdList.map((item) => new ObjectId(item)),
      },
    });
  }

  // 根据用户id查询成员
  async findAllByUserId({ userId }): Promise<WorkspaceMember[]> {
    return this.workspaceMemberRepository.find({
      where: {
        userId,
      },
    });
  }

  // 根据空间id查询成员
  async findAllByWorkspaceId({ workspaceId }): Promise<WorkspaceMember[]> {
    return this.workspaceMemberRepository.find({
      where: {
        workspaceId,
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
      select: ['_id', 'createDate', 'curStatus', 'role', 'userId'],
    });
  }

  // 根据空间id和用户id查询成员
  async findOne({ workspaceId, userId }): Promise<WorkspaceMember> {
    return this.workspaceMemberRepository.findOne({
      where: {
        workspaceId,
        userId,
      },
    });
  }

  // 更新成员角色
  async updateRole({ workspaceId, userId, role }) {
    return this.workspaceMemberRepository.updateOne(
      {
        workspaceId,
        userId,
      },
      {
        $set: {
          role,
        },
      },
    );
  }

  // 删除成员
  async deleteMember({ workspaceId, userId }) {
    return this.workspaceMemberRepository.deleteOne({
      workspaceId,
      userId,
    });
  }

  // 根据空间id统计成员数量
  async countByWorkspaceId({ workspaceId }) {
    return this.workspaceMemberRepository.count({
      workspaceId,
      'curStatus.status': {
        $ne: RECORD_STATUS.REMOVED,
      },
    });
  }

  // 根据空间id批量查询成员
  async batchSearchByWorkspace(workspaceList: string[]) {
    return await this.workspaceMemberRepository.find({
      where: {
        workspaceId: {
          $in: workspaceList,
        },
      },
      order: {
        _id: -1,
      },
      select: ['_id', 'userId', 'role', 'workspaceId'],
    });
  }
}
