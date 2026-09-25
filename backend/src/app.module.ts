import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { PredictionsModule } from './modules/predictions/predictions.module';
import { PanchayatsModule } from './modules/panchayats/panchayats.module';
import { AdvisoriesModule } from './modules/advisories/advisories.module';
import { ExplainabilityModule } from './modules/explainability/explainability.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    HealthModule,
    PredictionsModule,
    PanchayatsModule,
    AdvisoriesModule,
    ExplainabilityModule,
  ],
})
export class AppModule {}
