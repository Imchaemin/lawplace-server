import { Injectable } from '@nestjs/common';

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
}
