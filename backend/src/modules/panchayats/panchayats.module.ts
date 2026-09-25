import { Module } from '@nestjs/common';
import { PanchayatsController } from './panchayats.controller';
import { PanchayatsService } from './panchayats.service';
import { DatabaseService } from '../../database/database.service';

@Module({
  controllers: [PanchayatsController],
  providers: [PanchayatsService, DatabaseService],
  exports: [PanchayatsService],
})
export class PanchayatsModule {}
