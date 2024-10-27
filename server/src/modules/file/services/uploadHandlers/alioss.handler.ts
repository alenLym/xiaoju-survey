import OSS from 'ali-oss';
import { generateUniqueFilename } from '../../utils/generateUniqueFilename';
import { join } from 'path';
import { parseExpiryTimeToSeconds } from '../../utils/parseExpiryTimeToSeconds';
import { FileUploadHandler } from './uploadHandler.interface';

// 阿里云OSS上传处理器
export class AliOssHandler implements FileUploadHandler {
  private client: OSS;
  endPoint: string;
  useSSL: boolean;
  isPrivateRead: boolean;
  expiryTime: string;
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
    client?: OSS;
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
      // 创建客户端
      client = new OSS({
        region,
        accessKeyId: accessKey,
        accessKeySecret: secretKey,
        bucket,
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

    await this.client.put(key, file.buffer);

    return { key };
  }

  // 获取文件URL
  getUrl(key: string): string {
    // 解析过期时间
    const expireTimeSeconds = parseExpiryTimeToSeconds(this.expiryTime);
    // 如果需要私有读
    if (this.isPrivateRead) {
      const url = this.client.signatureUrl(key, {
        expires: expireTimeSeconds,
        method: 'GET',
      });
      return url;
    } else {
      return `${this.useSSL ? 'https' : 'http'}://${this.endPoint}/${key}`;
    }
  }
}
