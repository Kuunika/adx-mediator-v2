import { Module } from '@nestjs/common';
import { Dhis2Service } from './dhis2.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggingModule } from 'src/logging/logging.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ADX_LOGISTICS',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory(config: ConfigService) {
          return {
            transport: Transport.RMQ,
            options: {
              url: [config.get<string>('MEDIATOR_RABBITMQ_URI')],
              queue: config.get<string>('MEDIATOR_RABBITMQ_QUEUE'),
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
    LoggingModule,
  ],
  providers: [Dhis2Service],
  exports: [Dhis2Service],
})
export class Dhis2Module {}
