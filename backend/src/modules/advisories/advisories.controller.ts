import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdvisoriesService } from './advisories.service';
import { AdvisoryRequestDto } from './dto/advisory-request.dto';
import { AdvisoryResponseDto } from './dto/advisory-response.dto';

@ApiTags('Advisories')
@Controller('advisories')
export class AdvisoriesController {
  constructor(private readonly advisoriesService: AdvisoriesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate deterministic rule-based Agro-Meteorological Advisory',
    description:
      'Translates downscaled weather predictions and split-conformal uncertainty intervals into transparent, rule-based agricultural guidance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deterministic advisory generated successfully',
    type: AdvisoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input payload or inverted interval bounds' })
  generateAdvisory(@Body() dto: AdvisoryRequestDto): AdvisoryResponseDto {
    return this.advisoriesService.generateAdvisory(dto);
  }
}
