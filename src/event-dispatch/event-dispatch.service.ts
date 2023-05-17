import { Injectable } from '@nestjs/common';
import { AdxMigrationPayloadDto } from '../common/dtos';
import { writeFile, mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'path';
import { LoggingService } from '../logging/logging.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum MigrationPayloadType {
  COMPLETED_DATA_SETS,
  REPORTED_DATA_ELEMENTS,
}
export type EventDispatchMetaData = { clientId: string; transactionId: string };

@Injectable()
export class EventDispatchService {
  constructor(
    private readonly log: LoggingService,
    //TODO: Consideration - as the number of system linked to the ADX continues we might need to find a better way or registering the client proxies
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    migrationPayload: AdxMigrationPayloadDto,
    { clientId, transactionId }: EventDispatchMetaData,
  ) {
    let migrationPayloadType: MigrationPayloadType;

    if (migrationPayload['data-set']) {
      migrationPayloadType = MigrationPayloadType.COMPLETED_DATA_SETS;
    } else {
      migrationPayloadType = MigrationPayloadType.REPORTED_DATA_ELEMENTS;
    }

    await this.storeMigrationPayload(clientId, transactionId, migrationPayload);

    //TODO: need to add some type safety to this to avoid stupid errors
    this.eventEmitter.emit('migration', {
      migrationPayload: migrationPayload,
      client: clientId,
      transactionId: transactionId,
      migrationPayloadType: migrationPayloadType,
    });

    // TODO: Need to redo this when we get the chance
    /*
    if (clientId === 'openlmis') {
      this.gfpvan_client.emit<any>('gfpvan', {
        dataElementsFile,
        client: metaData.clientId,
        transactionId: metaData.transactionId,
        timestamp: new Date().toISOString(),
      });
    }*/

    this.log.info(
      `Payload for transaction: ${transactionId} from client${clientId}`,
      {
        timestamp: new Date().toISOString(),
        clientId,
        transactionId,
      },
    );
  }

  private async storeMigrationPayload(
    clientId: string,
    transactionId: string,
    adxMigrationPayloadDto: AdxMigrationPayloadDto,
  ) {
    const clientsDirPath = join(process.cwd(), 'migrations', clientId);
    const clientMigrationDtoPath = join(clientsDirPath, transactionId);

    if (!existsSync(join(process.cwd(), 'migrations'))) {
      await mkdir(join(process.cwd(), 'migrations'));
    }

    if (!existsSync(clientsDirPath)) {
      await mkdir(clientsDirPath);
    }
    if (!existsSync(clientMigrationDtoPath)) {
      await mkdir(clientMigrationDtoPath);
    }
    await writeFile(
      join(clientMigrationDtoPath, `${transactionId}.json`),
      JSON.stringify(adxMigrationPayloadDto),
      {
        encoding: 'utf8',
        flag: 'w',
      },
    );
  }
}
