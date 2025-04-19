import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@/prisma/prisma.module';

import { FirebaseModule } from '../firebase/firebase.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthOauthController } from './controllers/auth-oauth.controller';
import { AuthService } from './services/auth.service';
import { AuthOauthService } from './services/auth-oauth.service';

@Module({
  imports: [PrismaModule, HttpModule, JwtModule, UserModule, FirebaseModule],
  controllers: [AuthController, AuthOauthController],
  providers: [AuthService, AuthOauthService],
  exports: [AuthService, AuthOauthService],
})
export class AuthModule {}
