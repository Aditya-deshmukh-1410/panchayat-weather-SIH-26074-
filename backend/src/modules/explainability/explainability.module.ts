import { Module } from '@nestjs/common';
import { ExplainabilityController } from './explainability.controller';
import { ExplainabilityService } from './explainability.service';

@Module({
  controllers: [ExplainabilityController],
  providers: [ExplainabilityService],
  exports: [ExplainabilityService],
})
export class ExplainabilityModule {}
