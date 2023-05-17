import { Test, TestingModule } from '@nestjs/testing';
import { AdxValidationService } from './adx-validation.service';

describe('AdxValidationService', () => {
  let service: AdxValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdxValidationService],
    }).compile();

    service = module.get<AdxValidationService>(AdxValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
