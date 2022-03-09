import { Module } from '@nestjs/common';
import { Dhis2Service } from './dhis2.service';
import { Dhis2Controller } from './dhis2.controller';

@Module({
  controllers: [Dhis2Controller],
  providers: [Dhis2Service],
})
export class Dhis2Module {}
