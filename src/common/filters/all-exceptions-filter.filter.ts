import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpAdapterHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { LoggingService } from '../../logging/logging.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly log: LoggingService,
  ) {}

  catch(error: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus;
    let ip;
    if (process.env.NODE_ENV === 'OPENHIM') {
      //NOTE: Assumption here is the OpenHIM is sitting behind NGINX, otherwise the we can know know the IP Address where the request came from.
      ip = ctx.getRequest<Request>().headers['x-real-ip'] as string;
      if (ip === undefined) {
        ip = ctx.getRequest<Request>().ip;
      }
    } else {
      ip = ctx.getRequest<Request>().ip;
    }
    const path = httpAdapter.getRequestUrl(ctx.getRequest());
    if (error instanceof HttpException) {
      httpStatus = error.getStatus();
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      const { message, name, stack } = error as Error;
      this.log.error(message, {
        ip,
        stack,
        name,
        path,
      });
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path,
    };
    this.log.error('Response', {
      clientId: ctx.getRequest<Request>()?.headers[
        'x-openhim-clientid'
      ] as string,
      ip,
      transactionId: ctx.getRequest<Request>()?.headers[
        'x-openhim-transactionid'
      ] as string,
      httpStatus,
      method: ctx.getRequest<Request>().method,
      path,
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
