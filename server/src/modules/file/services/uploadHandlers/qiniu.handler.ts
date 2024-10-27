import qiniu from 'qiniu';
import { join } from 'path';
import { generateUniqueFilename } from '../../utils/generateUniqueFilename';
import { parseExpiryTimeToSeconds } from '../../utils/parseExpiryTimeToSeconds';
import { FileUploadHandler } from './uploadHandler.interface';

// 七牛上传处理器
export class QiniuHandler implements FileUploadHandler {
  private bucket: string;
  private endPoint: string;
  private useSSL: boolean;
  private isPrivateRead: boolean;
  private expiryTime: string;
  private mac: qiniu.auth.digest.Mac;

  constructor({
    accessKey,
    secretKey,
    bucket,
    endPoint,
    useSSL,
    isPrivateRead,
    expiryTime,
  }) {
    // 设置桶
    this.bucket = bucket;
    // 设置端点
    this.endPoint = endPoint;
    // 设置是否使用SSL
    this.useSSL = useSSL;
    // 设置是否私有读
    this.isPrivateRead = isPrivateRead;
    // 设置过期时间
    this.expiryTime = expiryTime;
    // 创建mac
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.mac = mac;
  }

  // 上传文件
  async upload(
    file: Express.Multer.File,
    options?: { pathPrefix?: string },
  ): Promise<{ key: string }> {
    // 创建配置
    const config = new qiniu.conf.Config();
    // 创建表单上传器
    const formUploader = new qiniu.form_up.FormUploader(config);
    // 创建表单上传额外信息
    const putExtra = new qiniu.form_up.PutExtra();
    // 生成唯一文件名
    const key = join(
      options?.pathPrefix ? options?.pathPrefix : '',
      await generateUniqueFilename(file.originalname),
    );

    // 创建上传策略
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: this.bucket + ':' + key,
    });

    // 创建上传令牌
    const uploadToken = putPolicy.uploadToken(this.mac);

    return new Promise<{ key: string }>((resolve, reject) => {
      formUploader.put(
        uploadToken,
        key,
        file.buffer,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr);
          }
          if (respInfo.statusCode === 200) {
            resolve({ key });
          } else {
            reject(respBody);
          }
        },
      );
    });
  }

  // 获取文件URL
  getUrl(key: string): string {
    if (!this.isPrivateRead) {
      return `${this.useSSL ? 'https' : 'http'}://${this.endPoint}/${key}`;
    }

    // 创建配置
    const config = new qiniu.conf.Config({
      useHttpsDomain: this.useSSL,
    });
    // 创建桶管理器
    const bucketManager = new qiniu.rs.BucketManager(this.mac, config);
    let url;
    // 如果需要私有读
    if (this.isPrivateRead) {
      const deadline =
        Math.floor(Date.now() / 1000) +
        parseExpiryTimeToSeconds(this.expiryTime);
      url = bucketManager.privateDownloadUrl(this.endPoint, key, deadline);
    } else {
      url = bucketManager.publicDownloadUrl(this.endPoint, key);
    }

    return this.useSSL ? `https://${url}` : `http://${url}`;
  }
}
