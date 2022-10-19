import { Body, Controller, Post, Headers } from '@nestjs/common';
import { Dhis2Service } from './dhis2/dhis2.service';
import { CreateDataElementsDto } from './dhis2/dto';

@Controller()
export class AppController {
  constructor(private readonly dhis2Service: Dhis2Service) {}

  @Post('data-elements')
  async create(
    //TODO: create a validation pipe for the incoming data
    @Body() createDataElementsDto: CreateDataElementsDto,
    @Headers() headers,
  ) {
    //TODO: there will need to be validation on the client and transaction ids
    const clientId = headers['x-openhim-clientid'];
    const transactionId = headers['x-openhim-transactionid'];
    const result = await this.dhis2Service.create(createDataElementsDto, {
      clientId,
      transactionId,
    });
    return {
      message: 'Payload received successfully',
      transactionId,
      notificationsChannel: result,
    };
  }
}
