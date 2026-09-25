import { Test, TestingModule } from '@nestjs/testing';
import { ExplainabilityController } from './explainability.controller';
import { ExplainabilityService } from './explainability.service';

describe('ExplainabilityController', () => {
  let controller: ExplainabilityController;
  let service: ExplainabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExplainabilityController],
      providers: [ExplainabilityService],
    }).compile();

    controller = module.get<ExplainabilityController>(ExplainabilityController);
    service = module.get<ExplainabilityService>(ExplainabilityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getExplainability', () => {
    it('should return valid global SHAP feature importance metadata', () => {
      const result = controller.getExplainability();

      expect(result).toBeDefined();
      expect(result.model_version).toBe('v0.1.0-alpha');
      expect(result.type).toBe('global_shap_importance');
      expect(result.scope).toBe('model_level');
      expect(result.total_features).toBe(17);
      expect(result.features).toHaveLength(17);

      // Check scientific disclaimer presence
      expect(result.disclaimer).toContain(
        'SHAP values describe how features contributed to the model prediction. They are model attributions, not causal evidence.',
      );

      // Verify top 5 features ranking and values match shap_summary.csv
      const top5 = result.features.slice(0, 5);
      expect(top5[0].feature).toBe('block_rainfall');
      expect(top5[0].label).toBe('Block rainfall');
      expect(top5[0].mean_abs_shap).toBeCloseTo(1.558552, 4);

      expect(top5[1].feature).toBe('block_humidity');
      expect(top5[1].label).toBe('Block humidity');
      expect(top5[1].mean_abs_shap).toBeCloseTo(1.0810268, 4);

      expect(top5[2].feature).toBe('rainfall_lag_1d');
      expect(top5[2].label).toBe('Previous-day rainfall');
      expect(top5[2].mean_abs_shap).toBeCloseTo(0.61903375, 4);

      expect(top5[3].feature).toBe('day_of_year');
      expect(top5[3].label).toBe('Day of year');
      expect(top5[3].mean_abs_shap).toBeCloseTo(0.3278668, 4);

      expect(top5[4].feature).toBe('block_temp_max');
      expect(top5[4].label).toBe('Block maximum temperature');
      expect(top5[4].mean_abs_shap).toBeCloseTo(0.180721, 4);

      // Verify descending order
      for (let i = 0; i < result.features.length - 1; i++) {
        expect(result.features[i].mean_abs_shap).toBeGreaterThanOrEqual(
          result.features[i + 1].mean_abs_shap,
        );
      }
    });

    it('getGlobalExplainability alias should return identical response', () => {
      const primary = controller.getExplainability();
      const alias = controller.getGlobalExplainability();
      expect(alias).toEqual(primary);
    });
  });
});
