import { Entity, Column, Index, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { ENCRYPT_TYPE } from '../enums/encrypt';
import { BaseEntity } from './base.entity';

// 客户端加密实体
@Entity({ name: 'clientEncrypt' })
export class ClientEncrypt extends BaseEntity {
  // 过期时间
  @Index({
    expireAfterSeconds:
      new Date(Date.now() + 2 * 60 * 60 * 1000).getTime() / 1000,
  })
  // 主键
  @ObjectIdColumn()
  _id: ObjectId;

  // 数据
  @Column('jsonb')
  data: {
    secretKey?: string; // aes加密的密钥
    publicKey?: string; // rsa加密的公钥
    privateKey?: string; // rsa加密的私钥
  };

  // 类型
  @Column()
  type: ENCRYPT_TYPE;
}
