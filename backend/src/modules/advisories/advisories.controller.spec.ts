import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AdvisoriesController } from './advisories.controller';
import { AdvisoriesService } from './advisories.service';
import { RainfallCategory, AdvisorySeverity } from './interfaces/advisory.interface';
import { AdvisoryRequestDto } from './dto/advisory-request.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('AdvisoriesController & Service', () => {
  let controller: AdvisoriesController;
  let service: AdvisoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvisoriesController],
      providers: [AdvisoriesService],
    }).compile();

    controller = module.get<AdvisoriesController>(AdvisoriesController);
    service = module.get<AdvisoriesService>(AdvisoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('Rainfall Category Classification & Boundaries', () => {
    it('1. Very low rainfall (0.5 mm) -> category: very_low, severity: INFO', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 0.5,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.VERY_LOW);
      expect(res.severity).toBe(AdvisorySeverity.INFO);
      expect(res.category_label).toBe('DRY / VERY LOW RAINFALL');
      expect(res.headline).toBe('Dry / Very low rainfall signal');
      expect(res.recommendations[0]).toContain('< 1 mm');
    });

    it('2. Light rainfall (2.5 mm) -> category: light, severity: INFO', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 2.5,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.LIGHT);
      expect(res.severity).toBe(AdvisorySeverity.INFO);
      expect(res.category_label).toBe('LIGHT RAINFALL');
      expect(res.headline).toBe('Light rainfall signal');
      expect(res.recommendations[0]).toContain('1–5 mm');
    });

    it('3. Moderate rainfall (8.56 mm) -> category: moderate, severity: WATCH', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 8.56,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.MODERATE);
      expect(res.severity).toBe(AdvisorySeverity.WATCH);
      expect(res.category_label).toBe('MODERATE RAINFALL');
      expect(res.headline).toBe('Moderate rainfall signal');
      expect(res.recommendations[0]).toContain('5–20 mm');
    });

    it('4. Heavy rainfall (25.0 mm) -> category: heavy, severity: CAUTION', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 25.0,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.HEAVY);
      expect(res.severity).toBe(AdvisorySeverity.CAUTION);
      expect(res.category_label).toBe('HEAVY RAINFALL');
      expect(res.headline).toBe('Heavy rainfall signal');
      expect(res.recommendations[0]).toContain('≥ 20 mm');
    });

    it('5. Exact boundary: 0 mm -> category: very_low, severity: INFO', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 0.0,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.VERY_LOW);
      expect(res.severity).toBe(AdvisorySeverity.INFO);
    });

    it('6. Exact boundary: 1.0 mm -> category: light, severity: INFO', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 1.0,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.LIGHT);
      expect(res.severity).toBe(AdvisorySeverity.INFO);
    });

    it('7. Exact boundary: 5.0 mm -> category: moderate, severity: WATCH', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 5.0,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.MODERATE);
      expect(res.severity).toBe(AdvisorySeverity.WATCH);
    });

    it('8. Exact boundary: 20.0 mm -> category: heavy, severity: CAUTION', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 20.0,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.HEAVY);
      expect(res.severity).toBe(AdvisorySeverity.CAUTION);
    });
  });

  describe('Conformal Uncertainty Handling', () => {
    it('9. Uncertainty interval crossing categories (0.40 - 16.73 mm) -> spans_multiple_categories: true', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 8.56,
        lower_80_mm: 0.4,
        upper_80_mm: 16.73,
      });
      expect(res.uncertainty).toBeDefined();
      expect(res.uncertainty?.spans_multiple_categories).toBe(true);
      expect(res.uncertainty?.categories_spanned).toEqual([
        RainfallCategory.VERY_LOW,
        RainfallCategory.LIGHT,
        RainfallCategory.MODERATE,
      ]);
      expect(res.uncertainty?.uncertainty_note).toContain('spans dry / very low rainfall through moderate rainfall');
    });

    it('10. Uncertainty interval within one category (6.0 - 12.0 mm) -> spans_multiple_categories: false', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 8.0,
        lower_80_mm: 6.0,
        upper_80_mm: 12.0,
      });
      expect(res.uncertainty).toBeDefined();
      expect(res.uncertainty?.spans_multiple_categories).toBe(false);
      expect(res.uncertainty?.categories_spanned).toEqual([RainfallCategory.MODERATE]);
    });

    it('11. Uncertainty elevation: light rainfall (2.0 mm) with upper bound in moderate (8.0 mm) elevates severity to WATCH', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 2.0,
        lower_80_mm: 0.5,
        upper_80_mm: 8.0,
      });
      expect(res.rainfall_category).toBe(RainfallCategory.LIGHT);
      expect(res.severity).toBe(AdvisorySeverity.WATCH);
      expect(res.uncertainty?.uncertainty_note).toContain('Severity elevated to WATCH');
    });
  });

  describe('Validation & Error Rejection', () => {
    it('12. Inverted interval where lower > upper throws BadRequestException', () => {
      expect(() =>
        controller.generateAdvisory({
          panchayat_id: 'P01',
          date: '2024-09-01',
          rainfall_mm: 8.56,
          lower_80_mm: 16.73,
          upper_80_mm: 0.4,
        }),
      ).toThrow(BadRequestException);
    });

    it('13. DTO rejects negative rainfall', async () => {
      const dto = plainToInstance(AdvisoryRequestDto, {
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: -5.0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toContain('rainfall_mm must not be negative');
    });

    it('14. DTO rejects NaN and Infinity', async () => {
      const nanDto = plainToInstance(AdvisoryRequestDto, {
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: NaN,
      });
      const nanErrors = await validate(nanDto);
      expect(nanErrors.length).toBeGreaterThan(0);

      const infDto = plainToInstance(AdvisoryRequestDto, {
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: Infinity,
      });
      const infErrors = await validate(infDto);
      expect(infErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Ancillary Meteorological Notices', () => {
    it('15. Formats exact required wording for humidity and temperature without disease claims', () => {
      const res = controller.generateAdvisory({
        panchayat_id: 'P01',
        date: '2024-09-01',
        rainfall_mm: 8.56,
        humidity: 90.61,
        temperature_max: 39.5,
        wind_speed: 12.0,
      });

      expect(res.ancillary_notices).toContain(
        'High relative humidity is indicated. Local crop and field conditions should be monitored, particularly where prolonged moisture is present.',
      );
      expect(res.ancillary_notices).toContain(
        'Elevated maximum temperature is indicated; local crop and soil conditions may affect moisture demand.',
      );
      expect(res.ancillary_notices).toContain(
        'Brisk wind speeds (≥ 10 m/s) indicated; consider delaying foliar or pesticide spraying to avoid drift.',
      );
    });
  });
});
