import { Module } from '@nestjs/common';
import { TransformerService } from './transformer.service';
import { RegistryModule } from '../registry/registry.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  providers: [TransformerService],
  imports: [RegistryModule, LoggingModule],
  exports: [TransformerService],
})
export class TransformerModule {}
