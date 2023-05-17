import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { RegistryModule } from '../registry/registry.module';
import { ValidationService } from './validation.service';

@Module({
  providers: [ValidationService],
  imports: [RegistryModule, LoggingModule],
  exports: [ValidationService],
})
export class ValidationModule {}
