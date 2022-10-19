import { Inject, Injectable } from '@nestjs/common';
import { CreateDataElementsDto } from './dto';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { LoggingService } from 'src/logging/logging.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class Dhis2Service {
  constructor(
    private readonly log: LoggingService,
    //TODO: Consideration - as the number of system linked to the ADX continues we might need to find a better way or registering the client proxies
    @Inject('ADX_LOGISTICS_SERVICE') private logistics_client: ClientProxy,
    @Inject('GFPVAN_SERVICE') private gfpvan_client: ClientProxy,
  ) {}

  async create(
    createDataElementsDto: CreateDataElementsDto,
    metaData: { clientId: string; transactionId: string },
  ) {
    const { clientId, transactionId } = metaData;
    //TODO: this should read the path from an env
    const dataElementsFile = join(
      process.cwd(),
      'adx_logistics',
      'data_files',
      `${transactionId}.adx.json`,
    );
    await writeFile(dataElementsFile, JSON.stringify(createDataElementsDto), {
      encoding: 'utf8',
      flag: 'w',
    });
    try {
      await this.logistics_client.connect();
    } catch (error) {
      console.error(error);
    }

    this.logistics_client.emit<any>('adx_logistics', {
      dataElementsFile,
      client: metaData.clientId,
      transactionId: metaData.transactionId,
      timestamp: new Date().toISOString(),
    });

    if (clientId === 'OpenLMIS') {
      this.gfpvan_client.emit<any>('gfpvan', {
        dataElementsFile,
        client: metaData.clientId,
        transactionId: metaData.transactionId,
        timestamp: new Date().toISOString(),
      });
    }

    this.log.info(
      `Payload for transaction: ${transactionId} from client${clientId}`,
      {
        timestamp: new Date().toISOString(),
        clientId,
        transactionId,
      },
    );
  }
}
