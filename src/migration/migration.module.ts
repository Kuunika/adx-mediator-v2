import { Module } from '@nestjs/common';
import { Dhis2Module } from '../dhis2/dhis2.module';
import { LoggingModule } from '../logging/logging.module';
import { MigrationService } from './migration.service';

@Module({
  imports: [Dhis2Module, LoggingModule],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}
