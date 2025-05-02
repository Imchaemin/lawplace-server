import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@/prisma/prisma.module';

import { FirebaseModule } from '../firebase/firebase.module';
import { UserModule } from '../user/user.module';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthOauthController } from './controllers/auth-oauth.controller';
import { AdminAuthService } from './services/admin-auth.service';
import { AuthService } from './services/auth.service';
import { AuthOauthService } from './services/auth-oauth.service';

@Module({
  imports: [PrismaModule, HttpModule, JwtModule, UserModule, FirebaseModule],
  controllers: [AuthController, AuthOauthController, AdminAuthController],
  providers: [AuthService, AuthOauthService, AdminAuthService],
  exports: [AuthService, AuthOauthService, AdminAuthService],
})
export class AuthModule {}
