import { Injectable } from '@nestjs/common';
import { Logger, createLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';
import ecsFormat from '@elastic/ecs-winston-format';
import { Request, Response } from 'express';
import { MEDIATOR_NAME } from '../common/constants';

@Injectable()
export class LoggerService {
  private _logger: Logger;

  info(message: string, meta?: { req: Request; res: Response }) {
    this._logger.info(message, meta);
  }

  error(message: string, meta?: { req: Request; res: Response }) {
    this._logger.error(message, meta);
  }

  constructor() {
    this._logger = createLogger({
      level: 'info',
      defaultMeta: { service: MEDIATOR_NAME },
      format: ecsFormat({ convertReqRes: true }),
      transports: [this.fileTransport()],
    });
  }

  private fileTransport(): DailyRotateFile {
    return new DailyRotateFile({
      filename: 'adx-mediator-%DATE%.log',
      dirname: join(__dirname, '..', '..', 'logs'),
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
    });
  }
}
