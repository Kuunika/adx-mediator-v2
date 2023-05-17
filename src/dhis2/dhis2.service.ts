import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { MigrationSummary } from './types/migration-summary';
import { CompletedDataSet, ReportedDataElementsPayload } from '../common/types';

@Injectable()
export class Dhis2Service {
  constructor(private readonly httpService: HttpService) {}
  async pushDataValueSets(
    payload: CompletedDataSet | ReportedDataElementsPayload,
  ): Promise<MigrationSummary> {
    const migrationSummary = await lastValueFrom(
      this.httpService.post<MigrationSummary>('/dataValueSets', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 900_000,
      }),
    );
    return migrationSummary.data;
  }
}
