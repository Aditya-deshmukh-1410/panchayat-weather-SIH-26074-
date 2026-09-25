import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';
import { DatabaseService } from '../../database/database.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HealthController', () => {
  let controller: HealthController;
  let mockDbService: { getHealthStatus: jest.Mock };

  beforeEach(async () => {
    mockDbService = {
      getHealthStatus: jest.fn().mockResolvedValue({
        status: 'connected',
        postgis_version: 'POSTGIS="3.6.2"',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://127.0.0.1:8000'),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return 200 OK with connected database and ML service', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { status: 'ok', service: 'ml-service' },
    });

    const res = await controller.checkHealth();
    expect(res.status).toBe('ok');
    expect(res.dependencies.database.status).toBe('connected');
    expect(res.dependencies.ml_service.status).toBe('connected');
  });

  it('should report ml_service as unreachable when FastAPI is down without crashing', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Connection refused'));

    const res = await controller.checkHealth();
    expect(res.status).toBe('ok');
    expect(res.dependencies.database.status).toBe('connected');
    expect(res.dependencies.ml_service.status).toBe('unreachable');
  });
});
