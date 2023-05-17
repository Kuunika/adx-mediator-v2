import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Dhis2Module } from './dhis2/dhis2.module';
import { LoggingModule } from './logging/logging.module';
import { OpenHimService } from './open-him/open-him.service';
import { EventDispatchModule } from './event-dispatch/event-dispatch.module';
import { AdxModule } from './adx/adx.module';
import { ValidationModule } from './validation/validation.module';
import { MigrationModule } from './migration/migration.module';
import { EmailModule } from './email/email.module';
import { RegistryModule } from './registry/registry.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TransformerModule } from './transformer/transformer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    Dhis2Module,
    LoggingModule,
    EventDispatchModule,
    AdxModule,
    ValidationModule,
    MigrationModule,
    EmailModule,
    RegistryModule,
    TransformerModule,
  ],
  controllers: [AppController],
  providers: [AppService, OpenHimService],
})
export class AppModule {}
