import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AdxMigrationPayloadDto } from './common/dtos';
import { EventDispatchService } from './event-dispatch/event-dispatch.service';

@Controller()
export class AppController {
  constructor(private readonly eventDispatchService: EventDispatchService) { }

  @Post()
  async create(
    //TODO: create a validation pipe for the incoming data
    @Body() dto: any,
    @Headers() headers,
  ) {
    //TODO: there will need to be validation on the client and transaction ids
    const clientId = headers['x-openhim-clientid'];
    const transactionId = headers['x-openhim-transactionid'];
    let dataElementsDto: AdxMigrationPayloadDto = dto;
    if (typeof dto === 'string') {
      dataElementsDto = JSON.parse(dto);
    }


    const result = await this.eventDispatchService.create(dataElementsDto, {
      clientId,
      transactionId,
    });

    return {
      message: 'Payload received successfully',
      transactionId,
      notificationsChannel: null,
    };
  }
}
