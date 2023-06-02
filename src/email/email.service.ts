import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { LoggingService } from '../logging/logging.service';
import { Conflict } from '../dhis2/types/migration-summary';
import { MigrationSummary } from '../migration/types/migration-summary';
import { AdxMigrationEventPayload } from '../adx/adx.controller';
import { AdxMigrationPayloadDto } from 'src/common/dtos';

export type MailAttachment = {
  filename: string;
  path: string;
};

@Injectable()
export class EmailService {
  private transporter = createTransport({
    service: 'Outlook365',
    auth: {
      user: this.config.get<string>('EMAIL_USER'),
      pass: this.config.get<string>('EMAIL_PASSWORD').replace(/'/g, ''),
    },
  });
  constructor(
    private readonly config: ConfigService,
    private readonly log: LoggingService,
  ) {}

  async send(
    migrationSummary: MigrationSummary,
    { client, migrationPayload }: AdxMigrationEventPayload,
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: this.config.get<string>('EMAIL_USER'),
        //attachments,
        //TODO: the to section need to be set programmatically
        to: this.config.getOrThrow<string>('MAIL_LIST'),
        bcc: this.config.getOrThrow<string>('BCC_EMAIL'),
        subject: `Migration Completed for ${client} - ${migrationPayload?.description}`,
        text: this.createEmailMessage(migrationPayload, migrationSummary),
      });
      this.log.info('Message sent: %s', info.messageId);
    } catch (err) {
      const error = err as Error;
      this.log.error('There was an issue sending the email');
      this.log.error(error.message);
    }
  }

  createEmailMessage(
    migrationPayload: AdxMigrationPayloadDto,
    migrationSummary: MigrationSummary,
  ) {
    return `
    Data Migration for ${migrationPayload?.description} for Period: ${
      migrationPayload['reporting-period']
    }
    Total Imported Records: ${
      migrationSummary.importCount.imported +
      migrationSummary.importCount.updated
    }

    ${this.createConflictsMessage(
      migrationSummary.importCount.ignored,
      migrationSummary.conflicts,
    )}

    Regards,
    Malawi Ministry Of Health - Digital Health Division
    `;
  }

  createConflictsMessage(numberIgnored: number, conflicts: Conflict[]): string {
    const orgUnits = new Set<string>();
    const importConflicts = new Set<string>();

    conflicts.forEach((conflict) => {
      if (conflict.value === 'Org unit not found or not accessible') {
        orgUnits.add(conflict.object);
      } else {
        importConflicts.add(JSON.stringify(conflict));
      }
    });
    const lineBreaks = '_______________________________';
    return (
      `
    ${lineBreaks}
    Conflicts During Migration
    ${lineBreaks}
    Records Ignored: ${numberIgnored}
    ${lineBreaks}
    ${
      orgUnits.size !== 0
        ? `Conflicting OrgUnits\n${lineBreaks}\n
      ${Array.from(orgUnits)
        .map((org) => `- ${org}`)
        .join('\n')}\n${lineBreaks}`
        : ''
    }

    ${
      importConflicts.size !== 0
        ? `Other Conflicts:
      ${lineBreaks}
        ${Array.from(importConflicts).reduce((acc, cur) => {
          try {
            const conflict: Conflict = JSON.parse(cur) as Conflict;
            return `${acc}\n - ${conflict.object} ${conflict.value}`;
          } catch (error) {
            this.log.error(
              'There was an issue during the JSON Parse for the conflicts',
            );
            return acc;
          }
        }, '')}`
        : ''
    }
    `
        //this replaces is meant to remove the white space at the beginning of each line in the message
        .replace(/^\s+/gm, '')
    );
  }
}
