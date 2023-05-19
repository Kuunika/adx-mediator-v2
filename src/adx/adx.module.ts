import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { MigrationModule } from '../migration/migration.module';
import { ValidationModule } from '../validation/validation.module';
import { LoggingModule } from '../logging/logging.module';
import { AdxController } from './adx.controller';
import { RegistryModule } from 'src/registry/registry.module';
import { Dhis2Module } from 'src/dhis2/dhis2.module';
import { TransformerModule } from 'src/transformer/transformer.module';

@Module({
  controllers: [AdxController],
  imports: [
    ValidationModule,
    TransformerModule,
    Dhis2Module,
    MigrationModule,
    LoggingModule,
    EmailModule,
    RegistryModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AdxModule {}
