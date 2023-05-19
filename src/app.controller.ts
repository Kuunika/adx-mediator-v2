import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AdxMigrationPayloadDto } from './common/dtos';
import { EventDispatchService } from './event-dispatch/event-dispatch.service';

@Controller()
export class AppController {
  constructor(private readonly eventDispatchService: EventDispatchService) {}

  @Post()
  async create(
    //TODO: create a validation pipe for the incoming data
    @Body() createDataElementsDto: AdxMigrationPayloadDto,
    @Headers() headers,
  ) {
    //TODO: there will need to be validation on the client and transaction ids
    const clientId = headers['x-openhim-clientid'];
    const transactionId = headers['x-openhim-transactionid'];

    const result = await this.eventDispatchService.create(
      createDataElementsDto,
      {
        clientId,
        transactionId,
      },
    );
    return {
      message: 'Payload received successfully',
      transactionId,
      notificationsChannel: null,
    };
  }
}
