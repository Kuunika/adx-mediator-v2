import { Module } from '@nestjs/common';
import { Dhis2Service } from './dhis2.service';
import { LoggingModule } from 'src/logging/logging.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Agent } from 'node:https';

//TODO: find a way to throw an error if the service is unable to connect to the rabbitmq instance
@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          auth: {
            password: config.get<string>('DHIS2_PASSWORD'),
            username: config.get<string>('DHIS2_USERNAME'),
          },
          timeout: 50_000,
          baseURL: config.get<string>('DHIS2_URL'),
          httpsAgent: new Agent({
            rejectUnauthorized: false,
          }),
        };
      },
    }),
  ],
  providers: [Dhis2Service],
  exports: [Dhis2Service],
})
export class Dhis2Module {}
