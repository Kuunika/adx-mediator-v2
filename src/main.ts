import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { readFile } from 'fs/promises';
import {
  MEDIATOR_API_DESCRIPTION,
  MEDIATOR_API_TAG,
  MEDIATOR_NAME,
  MEDIATOR_API_PORT,
  MEDIATOR_API_VERSION,
} from './common/constants';

async function bootstrap() {
  const app = await createAppEnvironment();
  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors();

  const apiPort = configService.get<number>(MEDIATOR_API_PORT) || 3000;
  const apiVersion = configService.get<string>(MEDIATOR_API_VERSION) || 'v1';
  app.setGlobalPrefix(`api/${apiVersion}`);

  const config = new DocumentBuilder()
    .setTitle(MEDIATOR_NAME)
    .setDescription(MEDIATOR_API_DESCRIPTION)
    .setVersion(apiVersion)
    .addTag(MEDIATOR_API_TAG)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`api/${apiVersion}/docs`, app, document);

  await app.listen(apiPort);
}

async function createAppEnvironment() {
  if (process.env.NODE_ENV === 'PRODUCTION') {
    const keyFile = await readFile(process.env.KEY_LOCATION);
    const certFile = await readFile(process.env.CRT_LOCATION);

    return NestFactory.create(AppModule, {
      httpsOptions: {
        key: keyFile,
        cert: certFile,
      },
    });
  }
  return NestFactory.create(AppModule);
}

bootstrap();
