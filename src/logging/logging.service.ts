import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Logger, transports, format, createLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggingService {
  private _logger: Logger;

  constructor(private readonly config: ConfigService) {
    const name = process.env.npm_package_name;
    let format;
    const env = process.env.NODE_ENV;
    if (env === 'PRODUCTION') {
      format = this.productionTransport();
    } else {
      format = this.developmentTransport();
    }
    this._logger = createLogger({
      level: env === 'DEVELOPMENT' ? 'debug' : 'info',
      defaultMeta: { service: name },
      transports: [format],
    });
  }

  info(message: string, meta?: any) {
    this._logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this._logger.warn(message, meta);
  }

  error(message: string, meta?: any) {
    this._logger.error(message, meta);
  }

  debug(message: string, meta?: any) {
    this._logger.debug(message, meta);
  }

  private developmentTransport() {
    const logFormat = format.printf(
      ({ level, message, timestamp, stack }) =>
        `${timestamp}: ${level} - ${message} ${
          stack !== undefined ? stack : ''
        }`,
    );
    return new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.errors({ stack: true }),
        logFormat,
      ),
    });
  }

  private productionTransport() {
    const maxLogFileSize = this.config.get<number>('MAX_LOG_FILE_SIZE') ?? 200;
    const name = process.env.npm_package_name;
    return new DailyRotateFile({
      filename: `${name}-%DATE%.log`,
      dirname: join(process.cwd(), 'logs'),
      datePattern: 'YYYY-MM-DD',
      format: format.combine(format.timestamp(), format.json()),
      maxSize: `${maxLogFileSize}m`,
    });
  }
}
