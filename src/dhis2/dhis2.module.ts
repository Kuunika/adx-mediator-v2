import { Module } from '@nestjs/common';
import { Dhis2Service } from './dhis2.service';
import { LoggingModule } from 'src/logging/logging.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

//TODO: find a way to throw an error if the service is unable to connect to the rabbitmq instance
@Module({
  imports: [
    LoggingModule,
    ClientsModule.registerAsync([
      {
        name: 'ADX_LOGISTICS_SERVICE',
        inject: [ConfigService],
        imports: [ConfigModule],
        useFactory(config: ConfigService) {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>('MEDIATOR_RABBITMQ_URI')],
              queue: config.getOrThrow<string>('ADX_LOGISTICS_SERVICE_QUEUE'),
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
      {
        name: 'GFPVAN_SERVICE',
        inject: [ConfigService],
        imports: [ConfigModule],
        useFactory(config: ConfigService) {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>('MEDIATOR_RABBITMQ_URI')],
              queue: config.getOrThrow<string>('GFPVAN_CLIENT_SERVICE_QUEUE'),
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [Dhis2Service],
  exports: [Dhis2Service],
})
export class Dhis2Module {}
