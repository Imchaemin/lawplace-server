import { Injectable } from '@nestjs/common';

import { FeatureFlag, FeatureFlagSchema } from '@/entities/feature-flag';
import { AppConfig, AppConfigSchema } from '@/entities/metadata';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class MetadataService {
  constructor(private readonly prisma: PrismaService) {}

  async getAppConfig(): Promise<AppConfig> {
    const appConfig = await this.prisma.appConfig.findFirst({
      select: {
        latestVersion: true,
        minSupportedVersion: true,
      },
    });

    return AppConfigSchema.parse(appConfig);
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const featureFlags = await this.prisma.featureFlag.findMany({
      select: {
        id: true,
        data: true,
      },
    });

    return featureFlags.map(featureFlag => FeatureFlagSchema.parse(featureFlag));
  }

  async getFeatureFlag(id: string): Promise<FeatureFlag> {
    const featureFlag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    return FeatureFlagSchema.parse(featureFlag);
  }
}
