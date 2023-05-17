import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  imports: [LoggingModule],
  exports: [EmailService],
})
export class EmailModule {}
