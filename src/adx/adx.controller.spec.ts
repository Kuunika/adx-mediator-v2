import { Test, TestingModule } from '@nestjs/testing';
import { AdxController } from './adx.controller';

describe('AdxController', () => {
  let controller: AdxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdxController],
    }).compile();

    controller = module.get<AdxController>(AdxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
