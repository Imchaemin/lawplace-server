import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@/prisma/prisma.module';

import { UserModule } from '../user/user.module';
import { AdminCompanyMemberController } from './controllers/admin-company-member.controller';
import { AdminCompanyMemberService } from './services/admin-company-member.service';

@Module({
  imports: [PrismaModule, HttpModule, JwtModule, UserModule],
  controllers: [AdminCompanyMemberController],
  providers: [AdminCompanyMemberService],
  exports: [AdminCompanyMemberService],
})
export class AdminModule {}
