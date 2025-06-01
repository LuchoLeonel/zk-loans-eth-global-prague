import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origins: ['*'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8400);
}
bootstrap();
