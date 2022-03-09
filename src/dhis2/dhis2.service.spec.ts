import { Test, TestingModule } from '@nestjs/testing';
import { Dhis2Service } from './dhis2.service';

describe('Dhis2Service', () => {
  let service: Dhis2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Dhis2Service],
    }).compile();

    service = module.get<Dhis2Service>(Dhis2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
