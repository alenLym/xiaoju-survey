import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';

import { Workspace } from 'src/models/workspace.entity';
import { SurveyMeta } from 'src/models/surveyMeta.entity';

import { ObjectId } from 'mongodb';
import { RECORD_STATUS } from 'src/enums';

interface FindAllByIdWithPaginationParams {
  workspaceIdList: string[];
  page: number;
  limit: number;
  name?: string;
}
interface FindAllByIdWithPaginationResult {
  list: Workspace[];
  count: number;
}

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: MongoRepository<Workspace>,
    @InjectRepository(SurveyMeta)
    private surveyMetaRepository: MongoRepository<SurveyMeta>,
  ) {}

  // 创建空间
  async create(workspace: {
    name: string;
    description: string;
    ownerId: string;
  }): Promise<Workspace> {
    const newWorkspace = this.workspaceRepository.create({
      ...workspace,
    });
    return this.workspaceRepository.save(newWorkspace);
  }

  // 获取空间信息
  async findOneById(id) {
    return this.workspaceRepository.findOne({
      where: {
        _id: new ObjectId(id),
      },
    });
  }

  // 获取空间列表
  async findAllById({
    workspaceIdList,
  }: {
    workspaceIdList: string[];
  }): Promise<Workspace[]> {
    const query = {
      _id: {
        $in: workspaceIdList.map((item) => new ObjectId(item)),
      },
      'curStatus.status': {
        $ne: RECORD_STATUS.REMOVED,
      },
    };

    return this.workspaceRepository.find({
      where: query,
      order: {
        _id: -1,
      },
      select: [
        '_id',
        'curStatus',
        'name',
        'description',
        'ownerId',
        'createDate',
      ],
    });
  }

  // 获取空间列表
  async findAllByIdWithPagination({
    workspaceIdList,
    page,
    limit,
    name,
  }: FindAllByIdWithPaginationParams): Promise<FindAllByIdWithPaginationResult> {
    const skip = (page - 1) * limit;
    if (!Array.isArray(workspaceIdList) || workspaceIdList.length === 0) {
      return { list: [], count: 0 };
    }
    const query = {
      _id: {
        $in: workspaceIdList.map((m) => new ObjectId(m)),
      },
      'curStatus.status': {
        $ne: RECORD_STATUS.REMOVED,
      },
    };
    if (name) {
      query['name'] = { $regex: name, $options: 'i' };
    }
    const [data, count] = await this.workspaceRepository.findAndCount({
      where: query,
      skip,
      take: limit,
      order: {
        createDate: -1,
      },
    });
    return { list: data, count };
  }

  // 更新空间
  async update(id: string, workspace: Partial<Workspace>) {
    return this.workspaceRepository.update(id, workspace);
  }

  // 删除空间
  async delete(id: string) {
    const newStatus = {
      status: RECORD_STATUS.REMOVED,
      date: Date.now(),
    };
    const workspaceRes = await this.workspaceRepository.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          curStatus: newStatus,
        },
        $push: {
          statusList: newStatus as never,
        },
      },
    );
    const surveyRes = await this.surveyMetaRepository.updateMany(
      {
        workspaceId: id,
      },
      {
        $set: {
          curStatus: newStatus,
        },
        $push: {
          statusList: newStatus as never,
        },
      },
    );
    return {
      workspaceRes,
      surveyRes,
    };
  }

  // 用户下的所有空间
  async findAllByUserId(userId: string) {
    return await this.workspaceRepository.find({
      where: {
        ownerId: userId,
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
      order: {
        _id: -1,
      },
      select: [
        '_id',
        'curStatus',
        'name',
        'description',
        'ownerId',
        'createDate',
      ],
    });
  }
}
