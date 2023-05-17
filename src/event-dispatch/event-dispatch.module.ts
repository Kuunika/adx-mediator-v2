import { Module } from '@nestjs/common';
import { EventDispatchService } from './event-dispatch.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [LoggingModule],
  providers: [EventDispatchService],
  exports: [EventDispatchService],
})
export class EventDispatchModule {}
