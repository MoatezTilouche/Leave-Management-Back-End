import { Test, TestingModule } from '@nestjs/testing';
import { CongeController } from './conge.controller';

describe('CongeController', () => {
  let controller: CongeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CongeController],
    }).compile();

    controller = module.get<CongeController>(CongeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
