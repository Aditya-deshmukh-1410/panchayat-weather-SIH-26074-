import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { PredictDto } from './dto/predict.dto';

describe('PredictionsController & DTO Validation', () => {
  let controller: PredictionsController;
  let service: PredictionsService;

  const validPayloadPlain = {
    block_rainfall: 5.62,
    block_temp_max: 26.72,
    block_temp_min: 21.5,
    block_humidity: 90.61,
    block_wind_speed: 4.11,
    latitude: 18.27524,
    longitude: 74.37465,
    elevation_m: 598.0,
    area_sqkm: 13.56,
    dist_to_block_center_km: 25.36,
    rainfall_lag_1d: 9.6,
    rainfall_lag_2d: 1.0,
    rainfall_lag_3d: 0.5,
    rainfall_rolling_7d_mean: 4.46,
    rainfall_rolling_7d_max: 15.8,
    day_of_year: 245,
    month: 9,
  };

  const mockPredictionResponse = {
    prediction_mm: 8.564,
    model_version: 'v0.1.0-alpha',
    target: 'daily_precipitation_mm',
    reference_type: 'ERA5-Land_reference_proxy',
  };

  const mockUncertaintyResponse = {
    prediction_mm: 8.564,
    lower_bound_80_mm: 0.3958,
    upper_bound_80_mm: 16.7322,
    lower_bound_90_mm: 0.0,
    upper_bound_90_mm: 21.8821,
    interval_width_80_mm: 16.3364,
    interval_width_90_mm: 21.8821,
    model_version: 'v0.1.0-alpha',
    uncertainty_method: 'split_conformal_prediction',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PredictionsController],
      providers: [
        {
          provide: PredictionsService,
          useValue: {
            predict: jest.fn().mockResolvedValue(mockPredictionResponse),
            predictWithUncertainty: jest
              .fn()
              .mockResolvedValue(mockUncertaintyResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<PredictionsController>(PredictionsController);
    service = module.get<PredictionsService>(PredictionsService);
  });

  describe('Controller delegation', () => {
    it('should delegate predict to PredictionsService', async () => {
      const dto = plainToInstance(PredictDto, validPayloadPlain);
      const res = await controller.predict(dto);
      expect(service.predict).toHaveBeenCalledWith(dto);
      expect(res).toEqual(mockPredictionResponse);
    });

    it('should delegate predictWithUncertainty to PredictionsService', async () => {
      const dto = plainToInstance(PredictDto, validPayloadPlain);
      const res = await controller.predictWithUncertainty(dto);
      expect(service.predictWithUncertainty).toHaveBeenCalledWith(dto);
      expect(res).toEqual(mockUncertaintyResponse);
    });
  });

  describe('DTO Validation Logic', () => {
    it('should pass validation with a complete and valid 17-feature payload', async () => {
      const dto = plainToInstance(PredictDto, validPayloadPlain);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when any required feature is missing', async () => {
      const incomplete = { ...validPayloadPlain };
      delete (incomplete as any).block_rainfall;

      const dto = plainToInstance(PredictDto, incomplete);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'block_rainfall')).toBe(true);
    });

    it('should fail validation when a feature has an invalid numeric range', async () => {
      const invalid = { ...validPayloadPlain, block_humidity: 150.0 }; // Humidity > 100%
      const dto = plainToInstance(PredictDto, invalid);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'block_humidity')).toBe(true);
    });

    it('should fail validation when negative rainfall is supplied', async () => {
      const invalid = { ...validPayloadPlain, block_rainfall: -5.0 };
      const dto = plainToInstance(PredictDto, invalid);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'block_rainfall')).toBe(true);
    });

    it('should fail validation when NaN or Infinity is passed', async () => {
      const nanPayload = { ...validPayloadPlain, block_temp_max: NaN };
      const dtoNan = plainToInstance(PredictDto, nanPayload);
      const errorsNan = await validate(dtoNan);
      expect(errorsNan.length).toBeGreaterThan(0);

      const infPayload = { ...validPayloadPlain, elevation_m: Infinity };
      const dtoInf = plainToInstance(PredictDto, infPayload);
      const errorsInf = await validate(dtoInf);
      expect(errorsInf.length).toBeGreaterThan(0);
    });

    it('should fail validation when month is outside 1..12 or day_of_year outside 1..366', async () => {
      const invalidMonth = { ...validPayloadPlain, month: 13 };
      const dtoMonth = plainToInstance(PredictDto, invalidMonth);
      const errorsMonth = await validate(dtoMonth);
      expect(errorsMonth.some((e) => e.property === 'month')).toBe(true);

      const invalidDoy = { ...validPayloadPlain, day_of_year: 400 };
      const dtoDoy = plainToInstance(PredictDto, invalidDoy);
      const errorsDoy = await validate(dtoDoy);
      expect(errorsDoy.some((e) => e.property === 'day_of_year')).toBe(true);
    });
  });
});
