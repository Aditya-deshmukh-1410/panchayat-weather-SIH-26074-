import { Module } from '@nestjs/common';
import { AdvisoriesController } from './advisories.controller';
import { AdvisoriesService } from './advisories.service';

@Module({
  controllers: [AdvisoriesController],
  providers: [AdvisoriesService],
  exports: [AdvisoriesService],
})
export class AdvisoriesModule {}
