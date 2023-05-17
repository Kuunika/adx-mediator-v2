import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoggingService } from '../logging/logging.service';
import { MigrationPayloadType } from '../event-dispatch/event-dispatch.service';
import { AdxMigrationPayloadDto } from '../common/dtos';
import { TransformerService } from '../transformer/transformer.service';
import { CompletedDataSet, ReportedDataElementsPayload } from '../common/types';
import { MigrationService } from '../migration/migration.service';
import { EmailService } from 'src/email/email.service';

export type AdxMigrationEventPayload = {
  migrationPayload: AdxMigrationPayloadDto;
  client: string;
  transactionId: string;
  migrationPayloadType: MigrationPayloadType;
};

export interface Dhis2SingularDataset {
  dataSet: string;
  completeDate: string;
  period: string;
  orgUnit: string;
  dataValues: DataValue[];
}

export interface DataValue {
  dataElement: string;
  categoryOptionCombo: string;
  value: number;
  comment: string;
}

@Controller('adx')
export class AdxController {
  constructor(
    private readonly email: EmailService,
    private readonly log: LoggingService,
    //Rename the call to the transformation service
    private readonly transformation: TransformerService,
    private readonly migration: MigrationService,
  ) {}

  @OnEvent('migration')
  async runMigration(eventPayload: AdxMigrationEventPayload) {
    //Validate

    //Transform
    let dhis2Payload: CompletedDataSet[] | ReportedDataElementsPayload[];
    if (
      eventPayload.migrationPayloadType ===
      MigrationPayloadType.COMPLETED_DATA_SETS
    ) {
      dhis2Payload = await this.transformation.toCompletedDataSetsPayload(
        eventPayload.migrationPayload,
      );
    }
    if (
      eventPayload.migrationPayloadType ===
      MigrationPayloadType.REPORTED_DATA_ELEMENTS
    ) {
      dhis2Payload = await this.transformation.toReportedDataElementsPayload(
        eventPayload.migrationPayload,
      );
    }
    this.log.info(`Transformation Complete`, {
      numberOfElements: dhis2Payload.length,
      transactionId: eventPayload.transactionId,
    });

    if (dhis2Payload === null) {
      this.log.error('No DHIS2 payload type specified in the request body');
      throw new Error('No DHIS2 payload type specified in the request body');
    }

    //Migrate (Push)
    const migrationSummary = await this.migration.start(
      eventPayload.transactionId,
      dhis2Payload,
    );

    //Send Email
    await this.email.send(
      eventPayload.migrationPayload.description,
      eventPayload.migrationPayload['reporting-period'],
    );
  }
}
