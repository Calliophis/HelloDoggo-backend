import { NestFactory } from '@nestjs/core';
import { AppModule } from './core/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200',
    allowedHeaders: 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization',
    methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  });
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
