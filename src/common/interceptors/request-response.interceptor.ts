import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggingService } from '../../logging/logging.service';
import { Request, Response } from 'express';
import { OpenHimService } from 'src/open-him/open-him.service';

@Injectable()
export class RequestResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggingService,
    private readonly openHim: OpenHimService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    let ip;

    if (process.env.NODE_ENV === 'OPENHIM') {
      //NOTE: Assumption here is the OpenHIM is sitting behind NGINX, otherwise the we can know know the IP Address where the request came from.
      ip = request.headers['x-real-ip'] as string;
      if (ip === undefined) {
        ip = request.ip;
      }
      this.openHim.setHeaders({
        clientId: request?.headers['x-openhim-clientid'] as string,
        ip,
        transactionId: request?.headers['x-openhim-transactionid'] as string,
      });
    } else {
      ip = request.ip;
    }
    this.logger.info('Request', {
      ip,
      method,
      url,
    });

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const { statusCode } = response;
        if (statusCode >= 400) {
          this.logger.error('Response', {
            clientId: request?.headers['x-openhim-clientid'] as string,
            ip,
            transactionId: request?.headers[
              'x-openhim-transactionid'
            ] as string,
            statusCode,
            method,
            url,
          });
        } else {
          this.logger.info('Response', {
            clientId: request?.headers['x-openhim-clientid'] as string,
            ip,
            transactionId: request?.headers[
              'x-openhim-transactionid'
            ] as string,
            statusCode,
            method,
            url,
          });
        }
      }),
    );
  }
}
