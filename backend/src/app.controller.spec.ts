import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const mockAppService = {
      getHello: jest.fn().mockReturnValue('Lockin Platform API'),
      checkDatabaseConnection: jest.fn().mockResolvedValue('connected'),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Lockin Platform API"', () => {
      expect(appController.getHello()).toBe('Lockin Platform API');
    });
  });

  describe('health', () => {
    it('should return health status with timestamp and database status', async () => {
      const result = await appController.getHealth();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
      expect(result.database).toBe('connected');
      expect(appService.checkDatabaseConnection).toHaveBeenCalled();
    });
  });
});
