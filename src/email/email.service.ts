import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { LoggingService } from '../logging/logging.service';

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
    migrationSummary: string,
    reportingPeriod: string,
    //attachments?: MailAttachment[],
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: this.config.get<string>('EMAIL_USER'),
        //attachments,
        to: this.config.get<string>('MAIL_LIST'),
        subject: migrationSummary,
        text: `Migration Successfully Completed For Reporting Period: ${reportingPeriod}
              
              Please find attached the migration reports for the reporting period.

              Regards,
              DHD Team
              
              This message was sent by an by an automated system. Please do not reply to this email.
              for any questions or concerns please contact Brett Onions at bonions@kuunika.org
              `,
      });
      //TODO: The message id is not showing up in the logs
      this.log.info('Message sent: %s', info.messageId);
    } catch (error) {
      this.log.error('There was an issue sending the email');
      this.log.error(error);
    }
  }
}
