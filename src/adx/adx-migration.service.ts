import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { EmailService, MailAttachment } from '../email/email.service';
import { LoggingService } from '../logging/logging.service';
import { MigrationService } from '../migration/migration.service';
import { AdxValidationService } from './adx-validation.service';
import { AdxMigrationMessageDto } from './dto/migration.dto';

@Injectable()
export class AdxMigrationService {
  constructor(
    private readonly log: LoggingService,
    private readonly adxValidationService: AdxValidationService,
    private readonly migrationService: MigrationService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async migrate(migration: AdxMigrationMessageDto) {
    //TODO: need to extract these into there own variables to provide more meaning to the data being returned
    const validatedData = await this.adxValidationService.validate(migration);

    let basePath: string;
    try {
      basePath = join(
        process.cwd(),
        'adx_logistics',
        'migrations',
        migration.client,
        validatedData[2],
        migration.transactionId,
      );
    } catch (error) {
      this.log.error('Error creating directory for migration', {
        transaction: migration.transactionId,
        timestamp: new Date().toISOString(),
        error,
      });
      throw error;
    }

    this.log.info('Created directory for migration ' + basePath);

    this.log.info(`Now Migrating Payload: ${migration.transactionId}`, {
      transaction: migration.transactionId,
      timestamp: new Date().toISOString(),
    });

    const RUN_MIGRATION = this.config.get<string>('RUN_MIGRATION');

    if (RUN_MIGRATION === 'true') {
      const { conflicts, importCount } = await this.migrationService.start(
        migration.transactionId,
        null, //validatedData[0],
      );

      this.log.info('Now storing the import report', {
        transaction: migration.transactionId,
        timestamp: new Date().toISOString(),
      });

      await writeFile(
        join(basePath, `import-report.${validatedData[2]}.json`),
        JSON.stringify(importCount),
        'utf-8',
      );

      this.log.info('Now storing the import conflicts', {
        transaction: migration.transactionId,
        timestamp: new Date().toISOString(),
      });

      await writeFile(
        join(basePath, `import-conflicts.${validatedData[2]}.json`),
        JSON.stringify(conflicts),
        'utf-8',
      );

      this.log.info(`Migration: ${migration.transactionId} complete`, {
        totalProducts: validatedData[1],
        totalMigrated: importCount.imported + importCount.updated,
        transaction: migration.transactionId,
        timestamp: new Date().toISOString(),
      });
      await this.sendEmailNotification(
        validatedData[2],
        this.createAttachments(basePath, validatedData[2]),
      );
      return;
    }
    this.log.info('Migrations are not enabled', {
      transaction: migration.transactionId,
      client: migration.client,
    });
  }

  private createAttachments(
    basePath: string,
    reportingPeriod: string,
  ): MailAttachment[] {
    const attachments: MailAttachment[] = [];
    attachments.push({
      filename: `import-report.${reportingPeriod}.json`,
      path: join(basePath, `import-report.${reportingPeriod}.json`),
    });
    attachments.push({
      filename: `import-conflicts.${reportingPeriod}.json`,
      path: join(basePath, `import-conflicts.${reportingPeriod}.json`),
    });
    attachments.push({
      filename: `missing-facilities.${reportingPeriod}.csv`,
      path: join(basePath, `missing-facilities.${reportingPeriod}.csv`),
    });
    attachments.push({
      filename: `missing-products.${reportingPeriod}.csv`,
      path: join(basePath, `missing-products.${reportingPeriod}.csv`),
    });
    return attachments;
  }

  private async sendEmailNotification(
    reportingPeriod: string,
    attachments: MailAttachment[],
  ) {
    const sendEmailNotification = this.config.get<string>(
      'SEND_EMAIL_NOTIFICATIONS',
    );
    if (sendEmailNotification === 'true') {
      //await this.emailService.send(reportingPeriod, attachments);
      return;
    }
    this.log.info('Email Notification Turned off');
  }
}
