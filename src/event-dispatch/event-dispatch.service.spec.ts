import { Test, TestingModule } from '@nestjs/testing';
import { EventDispatchService } from './event-dispatch.service';

describe('EventDispatchService', () => {
  let service: EventDispatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventDispatchService],
    }).compile();

    service = module.get<EventDispatchService>(EventDispatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
