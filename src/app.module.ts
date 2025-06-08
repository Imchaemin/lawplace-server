import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';

import { JWT_SECRET } from './constants';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { CreditModule } from './modules/credit/credit.module';
import { InitModule } from './modules/init/init.module';
import { MeetingRoomModule } from './modules/meeting-room/meeting-room.module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { NoticeModule } from './modules/notice/notice.module';
import { UserModule } from './modules/user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    JwtModule.register({ secret: JWT_SECRET }),

    InitModule,
    MetadataModule,
    AuthModule,
    CompanyModule,
    CreditModule,
    MeetingRoomModule,
    NoticeModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
