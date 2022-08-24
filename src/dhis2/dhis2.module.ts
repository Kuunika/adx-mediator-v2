import { Module } from '@nestjs/common';
import { Dhis2Service } from './dhis2.service';
import { LoggingModule } from 'src/logging/logging.module';

@Module({
  imports: [LoggingModule],
  providers: [Dhis2Service],
  exports: [Dhis2Service],
})
export class Dhis2Module {}
