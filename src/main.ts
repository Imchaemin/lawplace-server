import 'reflect-metadata';

import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { RedocModule, RedocOptions } from 'nestjs-redoc';

import { AppModule } from '@/app.module';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true,
  });

  // for graceful shutdown
  app.enableShutdownHooks();

  const apiDocumentOptions = new DocumentBuilder()
    .setTitle('Lawplace API')
    .setDescription('Lawplace API')
    .build();
  patchNestjsSwagger();

  const apiDocument = SwaggerModule.createDocument(app, apiDocumentOptions);
  const redocOptions: RedocOptions = {
    title: 'Lawplace API',
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false,
  };
  await RedocModule.setup('/api-docs', app, apiDocument, redocOptions);

  await app.listen(8080);
};

bootstrap();
