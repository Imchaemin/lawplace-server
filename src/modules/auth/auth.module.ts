import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@/prisma/prisma.module';

import { FirebaseModule } from '../firebase/firebase.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, HttpModule, JwtModule, UserModule, FirebaseModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AuthModule {}
