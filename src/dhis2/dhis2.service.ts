import { Injectable } from '@nestjs/common';
import { CreateDataElementsDto } from './dto';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { LoggingService } from 'src/logging/logging.service';

@Injectable()
export class Dhis2Service {
  constructor(private readonly log: LoggingService) {}

  async create(
    createDataElementsDto: CreateDataElementsDto,
    metaData: { clientId: string; transactionId: string },
  ) {
    const { clientId, transactionId } = metaData;
    //TODO: Needs to be reworked, this is ugly
    const dataElementsFile = join(
      process.cwd(),
      'adx_logistics',
      'data_files',
      `${metaData.transactionId}.adx.json`,
    );
    await writeFile(dataElementsFile, JSON.stringify(createDataElementsDto), {
      encoding: 'utf8',
      flag: 'w',
    });

    // this.client.emit<any>('migration', {
    //   dataElementsFile,
    //   client: metaData.clientId,
    //   transactionId: metaData.transactionId,
    //   timestamp: new Date().toISOString(),
    // });

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
