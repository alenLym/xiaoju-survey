import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  // 创建文档
  const config = new DocumentBuilder()
    .setTitle('XIAOJU SURVEY')
    .setDescription('')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('survey')
    .addTag('surveyResponse')
    .addTag('messagePushingTasks')
    .addTag('ui')
    .addBearerAuth()
    .build();
  // 创建文档
  const document = SwaggerModule.createDocument(app, config);
  // 设置文档
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT);
  console.log(`server is running at: http://127.0.0.1:${PORT}`);
}

bootstrap();
