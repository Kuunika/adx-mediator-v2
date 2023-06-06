import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { MigrationSummary } from './types/migration-summary';
import { CompletedDataSet, ReportedDataElementsPayload } from '../common/types';
import { LoggingService } from 'src/logging/logging.service';

@Injectable()
export class Dhis2Service {
  constructor(
    private readonly httpService: HttpService,
    private readonly log: LoggingService,
  ) {}
  async pushDataValueSets<T>(
    payload: CompletedDataSet | ReportedDataElementsPayload,
  ): Promise<T> {
    const migrationSummary = await lastValueFrom(
      this.httpService.post<T>('/dataValueSets', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 900_000,
      }),
    );
    const result = migrationSummary.data;
    return result as T;
  }
}
