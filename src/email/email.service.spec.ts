import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { LoggingService } from '../logging/logging.service';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: (name) => {
              return '';
            },
          },
        },
        {
          provide: LoggingService,
          useValue: {
            info: (message, meta) => {
              console.info(message, meta);
            },
            warn: (message, meta) => {
              console.warn(message, meta);
            },
            error: (message, meta) => {
              console.error(message, meta);
            },
            debug: (message, meta) => {
              console.debug(message, meta);
            },
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a string when running the createConflictsMessage Method', () => {
    const errorMessage = service.createConflictsMessage(20, [
      {
        object: '389593',
        value: 'This Data Element does not exist',
      },
      {
        object: '2759',
        value: 'Org unit not found or not accessible',
      },
      {
        object: '3144',
        value: 'Org unit not found or not accessible',
      },
      {
        object: 'SroPcWkDbAO',
        value: 'Org unit not found or not accessible',
      },
      {
        object: 'Makata Health Centre',
        value: 'Org unit not found or not accessible',
      },
      {
        object: 'VZ7Rgt1c3jY',
        value: 'Org unit not found or not accessible',
      },
    ]);
    console.log(errorMessage);
    expect(errorMessage).toBeTruthy();
  });
});
