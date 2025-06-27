import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Use cookie-parser middleware
  app.use(cookieParser());

  app.setGlobalPrefix('api', {
    exclude: [
      '/',
      '/index.html',
      '/admin-test.html',
      '/api-test.html',
      '/branch-test.html',
      '/frontend-debug.html',
      '/tablet-simulator.html',
      '/test-app.html',
      '/TestAuth.html',
      '/unlock-test.html',
      '/websocket-test.html',
    ],
  });

  // Enable CORS with specific configuration
  app.enableCors({
    origin: [
      'http://172.20.10.2:4321',
      'http://localhost:3002',
      'http://localhost:4321', // Only allow your frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
