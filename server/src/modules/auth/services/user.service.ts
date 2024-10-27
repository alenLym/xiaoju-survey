import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from 'src/models/user.entity';
import { HttpException } from 'src/exceptions/httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
import { hash256 } from 'src/utils/hash256';
import { RECORD_STATUS } from 'src/enums';
import { ObjectId } from 'mongodb';

// 用户服务
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  // 创建用户
  async createUser(userInfo: {
    username: string;
    password: string;
  }): Promise<User> {
    // 检查用户是否存在
    const existingUser = await this.userRepository.findOne({
      where: { username: userInfo.username },
    });

    // 如果用户已存在，则抛出错误
    if (existingUser) {
      throw new HttpException('该用户已存在', EXCEPTION_CODE.USER_EXISTS);
    }

    // 创建用户
    const newUser = this.userRepository.create({
      username: userInfo.username,
      password: hash256(userInfo.password),
    });

    return this.userRepository.save(newUser);
  }

  // 获取用户
  async getUser(userInfo: {
    username: string;
    password: string;
  }): Promise<User | undefined> {
    // 根据用户名和密码获取用户
    const user = await this.userRepository.findOne({
      where: {
        username: userInfo.username,
        password: hash256(userInfo.password), // Please handle password hashing here
      },
    });

    return user;
  }

  // 根据用户名获取用户
  async getUserByUsername(username) {
    // 根据用户名获取用户
    const user = await this.userRepository.findOne({
      where: {
        username: username,
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
    });

    return user;
  }

  // 根据ID获取用户
  async getUserById(id: string) {
    // 根据ID获取用户
    const user = await this.userRepository.findOne({
      where: {
        _id: new ObjectId(id),
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
    });

    return user;
  }

  // 根据用户名获取用户列表
  async getUserListByUsername({ username, skip, take }) {
    // 根据用户名获取用户列表
    const list = await this.userRepository.find({
      where: {
        username: new RegExp(username),
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
      skip,
      take,
      select: ['_id', 'username', 'createDate'],
    });
    return list;
  }

  // 根据ID列表获取用户列表
  async getUserListByIds({ idList }) {
    // 根据ID列表获取用户列表
    const list = await this.userRepository.find({
      where: {
        _id: {
          $in: idList.map((item) => new ObjectId(item)),
        },
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
      select: ['_id', 'username', 'createDate'],
    });
    return list;
  }
}
