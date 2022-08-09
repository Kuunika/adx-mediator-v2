import { Test, TestingModule } from '@nestjs/testing';
import { OpenHimService } from './open-him.service';

describe('OpenHieService', () => {
  let service: OpenHimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenHimService],
    }).compile();

    service = module.get<OpenHimService>(OpenHimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
