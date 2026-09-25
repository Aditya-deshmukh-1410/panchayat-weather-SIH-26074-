import { Test, TestingModule } from '@nestjs/testing';
import { PanchayatsController } from './panchayats.controller';
import { PanchayatsService } from './panchayats.service';
import { DatabaseService } from '../../database/database.service';

describe('PanchayatsController', () => {
  let controller: PanchayatsController;
  let service: PanchayatsService;

  const mockDatabaseService = {
    getPool: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue({
        query: jest.fn().mockImplementation((sql: string) => {
          if (sql.includes('blocks')) {
            return Promise.resolve({
              rows: [{ id: 'B01_BARAMATI', name: 'Baramati', district_name: 'Pune', state_name: 'Maharashtra' }],
            });
          }
          return Promise.resolve({
            rows: [
              {
                id: 'P01',
                name: 'Baburdi',
                census_code: '275210419903172200',
                area_sqkm: 13.56,
                elevation_m: 598.0,
                centroid_lat: 18.27524,
                centroid_lon: 74.37465,
                geojson: '{"type":"Polygon","coordinates":[]}',
              },
            ],
          });
        }),
        release: jest.fn(),
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PanchayatsController],
      providers: [
        PanchayatsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<PanchayatsController>(PanchayatsController);
    service = module.get<PanchayatsService>(PanchayatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should return all panchayats in GeoJSON format', async () => {
    const result = await controller.getAllPanchayats();
    expect(result.type).toBe('FeatureCollection');
    expect(result.features.length).toBe(1);
    expect(result.features[0].properties.id).toBe('P01');
    expect(result.features[0].properties.dist_to_block_center_km).toBe(25.36);
  });

  it('should return authentic features for P01 on 2024-09-01', () => {
    const record = controller.getPanchayatFeatures('P01', '2024-09-01');
    expect(record.panchayat_id).toBe('P01');
    expect(record.features.block_rainfall).toBe(5.62);
    expect(record.features.elevation_m).toBe(598.0);
    expect(record.features.month).toBe(9);
    expect(record.features.day_of_year).toBe(245);
  });
});
