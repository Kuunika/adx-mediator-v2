import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from 'src/logging/logging.service';
import { CompletedDataSet, ReportedDataElementsPayload } from '../common/types';
import { Dhis2Service } from '../dhis2/dhis2.service';
import { MigrationSummary } from './types/migration-summary';
import { ProductionMigrationSummary } from '../dhis2/types/production-migration-summary';
import { AxiosError } from 'axios';

@Injectable()
export class MigrationService {
  constructor(
    private readonly dhis2: Dhis2Service,
    private readonly config: ConfigService,
    private readonly log: LoggingService,
  ) {}

  async start(
    transactionId: string,
    cleintId: string,
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
      try {
        //TODO: have this capable of handling both the test instances response type and the production instances
        const dhis2Response =
          await this.dhis2.pushDataValueSets<ProductionMigrationSummary>(
            dataElement,
          );
        const conflicts = dhis2Response.response?.conflicts;
        const importCount = dhis2Response.response.importCount;
        if (conflicts?.length) {
          migrationReport.conflicts.push(...conflicts);
        }
        migrationReport.importCount.deleted += importCount?.deleted;
        migrationReport.importCount.ignored += importCount?.ignored;
        migrationReport.importCount.updated += importCount?.updated;
        migrationReport.importCount.imported += importCount?.imported;
        const ENABLE_DHIS2_MIGRATION_LOGGING = this.config.get<string>(
          'ENABLE_DHIS2_MIGRATION_LOGGING',
        );
        if (ENABLE_DHIS2_MIGRATION_LOGGING === 'true') {
          this.log.info(
            `State Of Current Migration element ${index + 1} of ${
              dataElements.length
            }`,
            {
              transaction: transactionId,
              timestamp: new Date().toISOString(),
              importCount: migrationReport.importCount,
              progress: ((index + 1) / dataElements.length) * 100,
            },
          );
        }
      } catch (err) {
        const error = err as AxiosError;

        if (error?.response.status === 409) {
          // @ts-ignore
          const conflict = error.response?.data?.response.conflicts[0];
          migrationReport.conflicts.push({
            object: conflict.object,
            value: conflict.value,
          });
          this.log.error('DHIS2 Error' + conflict.value);
        } else {
          this.log.error(
            `Unhandled exception thrown when trying to push data to DHIS2: ${error.message}`,
          );
        }
      }
    }

    return migrationReport;
  }
}
