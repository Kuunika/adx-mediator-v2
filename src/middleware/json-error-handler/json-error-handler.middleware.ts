import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { LoggingService } from 'src/logging/logging.service';

@Injectable()
export class JsonErrorHandlerMiddleware implements NestMiddleware {
  constructor(private readonly log: LoggingService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      this.log.info('Attempting to parse payload');
      const requestBody = JSON.parse(req.body);

      if (requestBody && typeof requestBody === 'object') {
        next();
      } else {
        throw new Error();
      }
    } catch (error) {
      try {
        this.log.info(
          'Parse failed. Now checking if exiting migration data exists',
        );
        const clientId = req.headers['x-openhim-clientid'] as string;
        const transactionId = req.headers['x-openhim-transactionid'] as string;
        const path = join(
          process.cwd(),
          'migrations',
          clientId,
          transactionId,
          `${transactionId}.json`,
        );
        const file = await readFile(path, 'utf-8');
        const payload = JSON.parse(file);
        req.body = payload;
        next();
      } catch (error) {
        res.status(400).json({
          message:
            'Bad Request, Please Check JSON Payload Structure and Try Again',
        });
      }
    }
  }
}
