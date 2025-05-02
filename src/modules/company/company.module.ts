import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { CompanyController } from './controllers/company.controller';
import { CompanyInvitationController } from './controllers/company-invitation.controller';
import { CompanyService } from './services/company.service';
import { CompanyInvitationService } from './services/company-invitation.service';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyInvitationController, CompanyController],
  providers: [CompanyInvitationService, CompanyService],
  exports: [CompanyInvitationService, CompanyService],
})
export class CompanyModule {}
