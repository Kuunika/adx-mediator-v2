import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/logging/logging.service';
import { OpenHieVariable } from './types/open-hie-variable';

interface OpenHimHeaders {
  clientId: string;
  transactionId: string;
  ip: string;
}

@Injectable()
export class OpenHimService {
  constructor(private readonly log: LoggingService) {}

  private variable: OpenHieVariable;
  private headers: OpenHimHeaders;

  getVariables(): OpenHieVariable {
    return this.variable;
  }

  setVariables(variable: OpenHieVariable): void {
    this.log.info('Configuration Received from Openhim');
    //NOTE: Add some form of validation for the incoming value, if it fails crash the app
    this.variable = variable;
  }

  setHeaders(header: OpenHimHeaders) {
    this.log.info('OpenHIM Headers Set');
    this.headers = header;
  }

  getHeader() {
    return this.headers;
  }
}
