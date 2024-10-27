import { join, dirname } from 'path';
import fse from 'fs-extra';
import { createWriteStream } from 'fs';
import { FileUploadHandler } from './uploadHandler.interface';
import { generateUniqueFilename } from '../../utils/generateUniqueFilename';

// 本地上传处理器
export class LocalHandler implements FileUploadHandler {
  private physicalRootPath: string;
  constructor({ physicalRootPath }: { physicalRootPath: string }) {
    this.physicalRootPath = physicalRootPath;
  }

  // 上传文件
  async upload(
    file: Express.Multer.File,
    options?: { pathPrefix?: string },
  ): Promise<{ key: string }> {
    // 生成唯一文件名
    const filename = await generateUniqueFilename(file.originalname);
    // 获取文件路径
    const filePath = join(
      options?.pathPrefix ? options?.pathPrefix : '',
      filename,
    );
    // 获取物理路径
    const physicalPath = join(this.physicalRootPath, filePath);
    // 创建目录
    await fse.mkdir(dirname(physicalPath), { recursive: true });
    // 创建写入流
    const writeStream = createWriteStream(physicalPath);
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () =>
        resolve({
          key: filePath,
        }),
      );
      writeStream.on('error', reject);
      writeStream.write(file.buffer);
      writeStream.end();
    });
  }

  // 获取文件URL
  getUrl(key: string): string {
    return `/${key}`;
  }
}
