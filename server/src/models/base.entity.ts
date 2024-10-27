import { Column, ObjectIdColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ObjectId } from 'mongodb';
import { RECORD_STATUS } from '../enums';

export class BaseEntity {
  // 主键
  @ObjectIdColumn()
  _id: ObjectId;

  // 当前状态
  @Column()
  curStatus: {
    status: RECORD_STATUS;
    date: number;
  };

  // 状态列表
  @Column()
  statusList: Array<{
    status: RECORD_STATUS;
    date: number;
  }>;

  // 创建时间
  @Column()
  createDate: number;

  // 更新时间
  @Column()
  updateDate: number;

  // 初始化默认信息
  @BeforeInsert()
  initDefaultInfo() {
    const now = Date.now();
    if (!this.curStatus) {
      const curStatus = { status: RECORD_STATUS.NEW, date: now };
      this.curStatus = curStatus;
      this.statusList = [curStatus];
    }
    this.createDate = now;
    this.updateDate = now;
  }

  // 更新时间
  @BeforeUpdate()
  onUpdate() {
    this.updateDate = Date.now();
  }
}
