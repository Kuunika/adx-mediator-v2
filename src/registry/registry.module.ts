import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { FacilityService } from './facility/facility.service';
import { ProductService } from './product/product.service';
import { Agent } from 'https';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    CacheModule.register(),
    HttpModule.register({
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    }),
    LoggingModule,
  ],
  providers: [FacilityService, ProductService],
  exports: [FacilityService, ProductService],
})
export class RegistryModule {}
