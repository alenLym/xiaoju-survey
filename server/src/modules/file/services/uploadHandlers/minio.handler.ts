import { Client } from 'minio';
import { generateUniqueFilename } from '../../utils/generateUniqueFilename';
import { join } from 'path';
import { parseExpiryTimeToSeconds } from '../../utils/parseExpiryTimeToSeconds';
import { FileUploadHandler } from './uploadHandler.interface';
import { HttpException } from 'src/exceptions/httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';

// minio上传处理器
export class MinIOHandler implements FileUploadHandler {
  private client: Client;
  endPoint: string;
  useSSL: boolean;
  isPrivateRead: boolean;
  expiryTime: string;
  bucket: string;
  constructor({
    client,
    accessKey,
    secretKey,
    bucket,
    region,
    endPoint,
    useSSL,
    isPrivateRead,
    expiryTime,
  }: {
    client?: Client;
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    region?: string;
    endPoint?: string;
    useSSL?: boolean;
    isPrivateRead?: boolean;
    expiryTime?: string;
  }) {
    // 如果客户端不存在
    if (!client) {
      client = new Client({
        endPoint,
        accessKey,
        secretKey,
        region,
        useSSL,
        pathStyle: true,
      });
    }
    // 设置客户端
    this.client = client;
    // 设置端点
    this.endPoint = endPoint;
    // 设置是否使用SSL
    this.useSSL = useSSL;
    // 设置是否私有读
    this.isPrivateRead = isPrivateRead;
    // 设置过期时间
    this.expiryTime = expiryTime;
    // 设置桶
    this.bucket = bucket;
  }

  // 上传文件
  async upload(
    file: Express.Multer.File,
    options?: {
      pathPrefix?: string;
    },
  ): Promise<{ key: string }> {
    // 获取路径前缀
    const { pathPrefix } = options || {};
    // 生成唯一文件名
    const key = join(
      pathPrefix || '',
      await generateUniqueFilename(file.originalname),
    );
    // 上传文件
    try {
      await this.client.putObject(this.bucket, key, file.buffer);

      return { key };
    } catch (error) {
      throw new HttpException(
        error.message || error.stack || '上传失败',
        EXCEPTION_CODE.UPLOAD_FILE_ERROR,
      );
    }
  }

  // 获取文件URL
  async getUrl(key: string): Promise<string> {
    // 解析过期时间
    const expireTimeSeconds = parseExpiryTimeToSeconds(this.expiryTime);
    // 如果需要私有读
    if (this.isPrivateRead) {
      const url = await this.client.presignedGetObject(
        this.bucket,
        key,
        expireTimeSeconds,
      );
      return url;
    }
    return `${this.useSSL ? 'https' : 'http'}://${this.endPoint}/${this.bucket}/${key}`;
  }
}
