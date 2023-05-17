import { Module } from '@nestjs/common';
import { TransformerService } from './transformer.service';
import { RegistryModule } from 'src/registry/registry.module';

@Module({
  providers: [TransformerService],
  imports:[RegistryModule],
  exports: [TransformerService],
})
export class TransformerModule {}
