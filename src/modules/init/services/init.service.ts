import { Injectable, OnModuleInit } from '@nestjs/common';
import { TermsAndConditionsType } from '@prisma/client';

import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.initTerms();
    await this.initAppConfig();
    await this.initNotificationCategory();
    await this.initMeetingRoom();
    await this.initOffice();
  }

  async initTerms() {
    await Promise.all([
      this.prisma.termsAndConditions.upsert({
        where: { id: 'TERMS_OF_SERVICE' },
        update: { required: true },
        create: {
          id: 'TERMS_OF_SERVICE',
          type: TermsAndConditionsType.TERMS_OF_SERVICE,
          required: true,
        },
      }),
      this.prisma.termsAndConditions.upsert({
        where: { id: 'PRIVACY_POLICY' },
        update: { required: true },
        create: {
          id: 'PRIVACY_POLICY',
          type: TermsAndConditionsType.PRIVACY_POLICY,
          required: true,
        },
      }),
      this.prisma.termsAndConditions.upsert({
        where: { id: 'MARKETING_POLICY' },
        update: { required: false },
        create: {
          id: 'MARKETING_POLICY',
          type: TermsAndConditionsType.MARKETING_POLICY,
          required: false,
        },
      }),
    ]);
  }

  async initAppConfig() {
    await this.prisma.appConfig.upsert({
      where: { id: 'APP_CONFIG' },
      update: {},
      create: {
        id: 'APP_CONFIG',
        latestVersion: '0.0.1',
        minSupportedVersion: '0.0.0',
      },
    });
  }

  async initNotificationCategory() {
    await Promise.all([
      this.prisma.notificationCategory.upsert({
        where: { id: 'COMPANY_INVITATION' },
        update: {},
        create: { id: 'COMPANY_INVITATION', name: 'COMPANY_INVITATION' },
      }),
      this.prisma.notificationCategory.upsert({
        where: { id: 'ADD_MEMBER' },
        update: {},
        create: { id: 'ADD_MEMBER', name: 'ADD_MEMBER' },
      }),
      this.prisma.notificationCategory.upsert({
        where: { id: 'REMOVE_MEMBER' },
        update: {},
        create: { id: 'REMOVE_MEMBER', name: 'REMOVE_MEMBER' },
      }),
      this.prisma.notificationCategory.upsert({
        where: { id: 'COMMUNITY' },
        update: {},
        create: { id: 'COMMUNITY', name: 'COMMUNITY' },
      }),
      this.prisma.notificationCategory.upsert({
        where: { id: 'ETC' },
        update: {},
        create: { id: 'ETC', name: 'ETC' },
      }),
    ]);
  }

  async initMeetingRoom() {
    await Promise.all([
      this.prisma.meetingRoom.upsert({
        where: { id: 'MEETING_ROOM_A' },
        update: {},
        create: {
          id: 'MEETING_ROOM_A',
          name: '회의실A',
          description: '',
          address: '회의실A',

          image: 'https://storage.googleapis.com/lawplace-assets/meeting-room-a.jpg',

          facilities: ['TV', '무선 인터넷', '연결 케이블'],

          active: true,

          capacity: 10,
          credit: 1,
          enablePeakTime: true,
          peakTimeCredit: 2,
          peakTimeStartAt: '14:00',
          peakTimeEndAt: '16:00',
          reservationInterval: 30,
        },
      }),
      this.prisma.meetingRoom.upsert({
        where: { id: 'MEETING_ROOM_B' },
        update: {},
        create: {
          id: 'MEETING_ROOM_B',
          name: '회의실B',
          description: '',
          address: '회의실B',

          image: 'https://storage.googleapis.com/lawplace-assets/meeting-room-b.jpg',

          facilities: ['TV', '무선 인터넷', '연결 케이블'],

          active: true,

          capacity: 8,
          credit: 1,
          enablePeakTime: true,
          peakTimeCredit: 2,
          peakTimeStartAt: '14:00',
          peakTimeEndAt: '16:00',
          reservationInterval: 30,
        },
      }),
      this.prisma.meetingRoom.upsert({
        where: { id: 'MEETING_ROOM_C' },
        update: {},
        create: {
          id: 'MEETING_ROOM_C',
          name: '회의실C',
          description: '',
          address: '회의실C',

          image: 'https://storage.googleapis.com/lawplace-assets/meeting-room-c.jpg',

          facilities: ['TV', '무선 인터넷', '연결 케이블'],

          active: true,

          capacity: 4,
          credit: 1,
          enablePeakTime: true,
          peakTimeCredit: 2,
          peakTimeStartAt: '14:00',
          peakTimeEndAt: '16:00',
          reservationInterval: 30,
        },
      }),
    ]);
  }

  async initOffice() {
    await this.prisma.office.upsert({
      where: { id: 'OFFICE_1' },
      update: {},
      create: {
        id: 'OFFICE_1',
        name: '로플레이스 안국',
        address: '서울특별시 종로구 율곡로 33, 1001호 (안국동, 안국빌딩)',
      },
    });
  }
}
