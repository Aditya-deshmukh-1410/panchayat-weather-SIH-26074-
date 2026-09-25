import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PanchayatsService } from './panchayats.service';

@ApiTags('Panchayats')
@Controller('panchayats')
export class PanchayatsController {
  constructor(private readonly panchayatsService: PanchayatsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all 14 Panchayats in Baramati Block with GeoJSON geometry',
    description:
      'Queries PostGIS for Panchayat boundaries, centroids, elevations, areas, and distance to block center in standard GeoJSON FeatureCollection format.',
  })
  @ApiResponse({ status: 200, description: 'GeoJSON FeatureCollection of 14 Panchayats' })
  async getAllPanchayats() {
    return this.panchayatsService.getAllPanchayats();
  }

  @Get(':id/features')
  @ApiOperation({
    summary: 'Get verified 17-feature input payload for a Panchayat on a historical date',
    description:
      'Retrieves the authentic, audited 17-feature meteorological and spatial record from the historical study table for inference.',
  })
  @ApiParam({ name: 'id', example: 'P01', description: 'Panchayat ID (e.g. P01 to P14)' })
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2024-09-01',
    description: 'Historical experiment date (defaults to 2024-09-01)',
  })
  @ApiResponse({ status: 200, description: 'Authentic 17-feature vector and baseline data' })
  @ApiResponse({ status: 404, description: 'Features unavailable for specified Panchayat or date' })
  getPanchayatFeatures(@Param('id') id: string, @Query('date') date?: string) {
    return this.panchayatsService.getPanchayatFeatures(id, date || '2024-09-01');
  }
}
