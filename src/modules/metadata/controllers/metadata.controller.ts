import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Controller, Get, Param, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FeatureFlag } from '@/entities/feature-flag';
import { AppConfig } from '@/entities/metadata';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { MetadataService } from '../services/metadata.service';

@ApiTags('METADATA')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('metadata')
@UsePipes(ZodValidationPipe)
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get('app-config')
  async getAppConfig(): Promise<AppConfig> {
    return this.metadataService.getAppConfig();
  }

  @Get('feature-flags')
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return this.metadataService.getFeatureFlags();
  }

  @Get('feature-flag/:id')
  async getFeatureFlag(@Param('id') id: string): Promise<FeatureFlag> {
    return this.metadataService.getFeatureFlag(id);
  }
}
