import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '../logging/logging.service';
import { ValidationService } from '../validation/validation.service';
import { AdxMigrationPayloadDto } from '../common/dtos';
import { AdxMigrationMessageDto } from './dto/migration.dto';
import { readFile, mkdir } from 'fs/promises';
import { storingMissingValues } from '../common/utility/store-to-csv';
import { join } from 'path';
import { ReportedDataElement } from '../common/types/reported-data-element';

@Injectable()
export class AdxValidationService {
  constructor(
    private readonly log: LoggingService,
    private readonly validationService: ValidationService,
    private readonly config: ConfigService,
  ) {}

  public async validate(
    migrationMessage: AdxMigrationMessageDto,
  ): Promise<[ReportedDataElement[][], number, string]> {
    this.log.info('Reading payload data from file', {
      transaction: migrationMessage.transactionId,
      timestamp: new Date().toISOString(),
    });

    if (!migrationMessage.client) {
      this.log.error('Client is not defined', {
        transaction: migrationMessage.transactionId,
        timestamp: new Date().toISOString(),
      });
      throw new Error('Client is not defined');
    }

    let adxPayload: AdxMigrationPayloadDto;

    try {
      const migrationDataJsonFile = await readFile(
        migrationMessage.dataElementsFile,
        {
          encoding: 'utf-8',
        },
      );
      adxPayload = JSON.parse(migrationDataJsonFile) as AdxMigrationPayloadDto;
    } catch (error) {
      this.log.error('Error reading payload data from file', {
        transaction: migrationMessage.transactionId,
        timestamp: new Date().toISOString(),
        error,
      });
      throw error;
    }

    this.log.info(
      `Now Validating Migration Payload: ${migrationMessage.transactionId}`,
      {
        transaction: migrationMessage.transactionId,
        timestamp: new Date().toISOString(),
      },
    );

    const {
      missingFacilities,
      missingProducts,
      payload,
      totalNumberOfValidatedProducts,
    } = await this.validationService.validate(
      adxPayload,
      migrationMessage.client,
    );

    if (totalNumberOfValidatedProducts === 0) {
      this.log.error('No products were validated', {
        transaction: migrationMessage.transactionId,
        timestamp: new Date().toISOString(),
      });
      throw new Error('No products were validated');
    }

    this.log.info(
      `Total number of validated products: ${totalNumberOfValidatedProducts}`,
    );

    this.log.info('Now Creating Missing Data CSV files', {
      transaction: migrationMessage.transactionId,
      timestamp: new Date().toISOString(),
      missingProducts: missingProducts.length,
      missingFacilities: missingFacilities.length,
    });

    const adxMigrationFolderBasePath = join(
      process.cwd(),
      'adx_logistics',
      'migrations',
      migrationMessage.client,
      adxPayload['reporting-period'],
      migrationMessage.transactionId,
    );

    await mkdir(adxMigrationFolderBasePath, {
      recursive: true,
    });

    await this.createMissingDataCsvFiles(
      adxMigrationFolderBasePath,
      missingFacilities,
      missingProducts,
      adxPayload['reporting-period'],
    );

    return [
      payload,
      totalNumberOfValidatedProducts,
      adxPayload['reporting-period'],
    ];
  }

  private async createMissingDataCsvFiles(
    basePath: string,
    missingFacilities: string[],
    missingProducts: string[],
    reportingPeriod: string,
  ) {
    await storingMissingValues(
      join(basePath, `missing-facilities.${reportingPeriod}.csv`),
      missingFacilities,
      'Facilities',
    );
    await storingMissingValues(
      join(basePath, `missing-products.${reportingPeriod}.csv`),
      missingProducts,
      'Products',
    );
  }
}
