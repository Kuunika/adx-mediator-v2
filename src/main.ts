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
  const config = app.get<ConfigService>(ConfigService);
  //TODO: have the limit read from a env or OpenHIM configuration
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ extended: true, limit: '500mb' }));

  /*const adx = await NestFactory.createMicroservice(AdxModule, {
    transport: Transport.RMQ,
    options: {
      urls: [config.get<string>('MEDIATOR_RABBITMQ_URI')],
      // This Queue is specific to the ADX Migrations service
      queue: config.get<string>('MEDIATOR_RABBITMQ_QUEUE'),
      queueOptions: {
        durable: true,
      },
    },
  });
  await adx.listen();*/

  const log = app.get<LoggingService>(LoggingService);
  const openHieService = app.get<OpenHimService>(OpenHimService);
  app.useGlobalInterceptors(
    new RequestResponseInterceptor(log, openHieService, config),
  );
  const httpAdapterHost = app.get<HttpAdapterHost>(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, log, config));
  const PORT = config.get<number>('PORT');
  const DEPLOYMENT = config.get<string>('DEPLOYMENT');
  const PREFIX = config.get<string>('URL_PREFIX');

  app.setGlobalPrefix(PREFIX);

  await app.listen(PORT);
  //TODO: When service is unable to connect to the OpenHIM, Crash and log to console.
  log.info('Application Started', { started: 'initial' });
  if (DEPLOYMENT === 'OPENHIM') {
    const mediatorConfigBuilder = new MediatorConfigBuilder();
    registerMediatorToOpenHim(
      mediatorConfigBuilder.build(),
      openHieService,
      log,
    );
  }
}

bootstrap();
