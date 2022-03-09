import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { LoggerInterceptor } from 'src/logger/logger.interceptor';
import { Dhis2Service } from './dhis2.service';
import { CreateDataElementsDto } from './dto';

@UseInterceptors(LoggerInterceptor)
@Controller('dhis2')
export class Dhis2Controller {
  constructor(private readonly dhis2Service: Dhis2Service) {}

  @Post('data-elements')
  async create(
    @Body() createDataElementsDto: CreateDataElementsDto,
    @Headers('x-openhim-clientid') client: string,
    @Headers('X-OpenHIM-TransactionID') requestId: string,
  ): Promise<{ migrationId: string }> {
    const result = await this.dhis2Service.create(createDataElementsDto);
    return { migrationId: 'xxxx' };
  }
}
