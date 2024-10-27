import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ClientEncrypt } from 'src/models/clientEncrypt.entity';
import { ENCRYPT_TYPE } from 'src/enums/encrypt';
import { ObjectId } from 'mongodb';
import { RECORD_STATUS } from 'src/enums';

@Injectable()
export class ClientEncryptService {
  constructor(
    @InjectRepository(ClientEncrypt)
    private readonly clientEncryptRepository: MongoRepository<ClientEncrypt>,
  ) {}

  // 添加AES信息
  addAes({ secretKey }) {
    const encryptInfo = this.clientEncryptRepository.create({
      data: {
        secretKey,
      },
      type: ENCRYPT_TYPE.AES,
    });
    return this.clientEncryptRepository.save(encryptInfo);
  }

  // 添加RSA信息
  addRsa({ publicKey, privateKey }) {
    const encryptInfo = this.clientEncryptRepository.create({
      data: {
        publicKey,
        privateKey,
      },
      type: ENCRYPT_TYPE.RSA,
    });
    return this.clientEncryptRepository.save(encryptInfo);
  }

  // 获取加密信息
  getEncryptInfoById(id) {
    return this.clientEncryptRepository.findOne({
      where: {
        _id: new ObjectId(id),
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
    });
  }

  // 删除加密信息
  deleteEncryptInfo(id: string) {
    return this.clientEncryptRepository.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          curStatus: {
            status: RECORD_STATUS.REMOVED,
            date: Date.now(),
          },
        },
      },
    );
  }
}
