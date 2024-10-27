import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Captcha } from 'src/models/captcha.entity';
import { ObjectId } from 'mongodb';

// 验证码服务
@Injectable()
export class CaptchaService {
  constructor(
    @InjectRepository(Captcha)
    private readonly captchaRepository: MongoRepository<Captcha>,
  ) {}

  // 创建验证码
  async createCaptcha(captchaText: string): Promise<Captcha> {
    const captcha = this.captchaRepository.create({
      text: captchaText,
    });

    return this.captchaRepository.save(captcha);
  }

  // 获取验证码
  async getCaptcha(id: string): Promise<Captcha | undefined> {
    return this.captchaRepository.findOne({ where: { _id: new ObjectId(id) } });
  }

  // 删除验证码
  async deleteCaptcha(id: string): Promise<void> {
    await this.captchaRepository.delete(new ObjectId(id));
  }

  // 检查验证码是否正确
  async checkCaptchaIsCorrect({ captcha, id }) {
    const captchaData = await this.captchaRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    return captcha.toLowerCase() === captchaData?.text?.toLowerCase();
  }
}
