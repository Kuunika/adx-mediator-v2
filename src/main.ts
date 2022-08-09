import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions-filter.filter';
import { RequestResponseInterceptor } from './common/interceptors/request-response.interceptor';
import { registerMediatorToOpenHim } from './lib/openhim';
import { LoggingService } from './logging/logging.service';
import { MediatorConfigBuilder } from './open-him/mediator-config-builder';
import { OpenHimService } from './open-him/open-him.service';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const configService = app.get<ConfigService>(ConfigService);
  const log = app.get<LoggingService>(LoggingService);
  const openHieService = app.get<OpenHimService>(OpenHimService);
  app.useGlobalInterceptors(
    new RequestResponseInterceptor(log, openHieService),
  );
  const httpAdapterHost = app.get<HttpAdapterHost>(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, log));
  const PORT = configService.get<number>('PORT');
  const ENVIRONMENT = configService.get<string>('NODE_ENV');
  const PREFIX = configService.get<string>('URL_PREFIX');

  app.setGlobalPrefix(PREFIX);
  await app.listen(PORT);
  //TODO: When service is unable to connect to the OpenHIM, Crash anc log to console.
  log.info('Application Started', { started: 'initial' });
  if (ENVIRONMENT === 'OPENHIM') {
    const mediatorConfigBuilder = new MediatorConfigBuilder();
    registerMediatorToOpenHim(
      mediatorConfigBuilder.build(),
      openHieService,
      log,
    );
  }
}

bootstrap();
