import { Test, TestingModule } from '@nestjs/testing';
import { AdxMigrationService } from './adx-migration.service';

describe('AdxMigrationService', () => {
  let service: AdxMigrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdxMigrationService],
    }).compile();

    service = module.get<AdxMigrationService>(AdxMigrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
