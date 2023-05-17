import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from 'src/logging/logging.service';
import { CompletedDataSet, ReportedDataElementsPayload } from '../common/types';
import { Dhis2Service } from '../dhis2/dhis2.service';
import { MigrationSummary } from './types/migration-summary';

@Injectable()
export class MigrationService {
  constructor(
    private readonly dhis2: Dhis2Service,
    private readonly config: ConfigService,
    private readonly log: LoggingService,
  ) {}

  async start(
    transactionId,
    dataElements: CompletedDataSet[] | ReportedDataElementsPayload[],
  ) {
    const migrationReport: MigrationSummary = {
      conflicts: [],
      importCount: {
        deleted: 0,
        ignored: 0,
        imported: 0,
        updated: 0,
      },
      transactionId,
    };

    for (const [index, dataElement] of dataElements.entries()) {
      const { importCount, conflicts } = await this.dhis2.pushDataValueSets(
        dataElement,
      );
      if (conflicts?.length) {
        migrationReport.conflicts.push(...conflicts);
      }
      migrationReport.importCount.deleted += importCount.deleted;
      migrationReport.importCount.ignored += importCount.ignored;
      migrationReport.importCount.updated += importCount.updated;
      migrationReport.importCount.imported += importCount.imported;
      const ENABLE_DHIS2_MIGRATION_LOGGING = this.config.get<string>(
        'ENABLE_DHIS2_MIGRATION_LOGGING',
      );
      if (ENABLE_DHIS2_MIGRATION_LOGGING === 'true') {
        this.log.info(JSON.stringify(importCount));
        this.log.info(
          `State Of Current Migration element ${index + 1} of ${
            dataElements.length
          }`,
          {
            transaction: transactionId,
            timestamp: new Date().toISOString(),
            importCount,
            conflicts,
          },
        );
      }
    }
    return migrationReport;
  }
}
