import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { CompanyInvitationController } from './controllers/company-invitation.controller';
import { CompanyInvitationService } from './services/company-invitation.service';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyInvitationController],
  providers: [CompanyInvitationService],
  exports: [CompanyInvitationService],
})
export class CompanyModule {}
