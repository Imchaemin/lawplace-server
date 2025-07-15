import { Injectable } from '@nestjs/common';
import { add } from 'date-fns';

import {
  MeetingRoom,
  MeetingRoomReservation,
  MeetingRoomReservationSchema,
  MeetingRoomSchema,
} from '@/entities/meeting-room';
import { PrismaService } from '@/prisma/services/prisma.service';

import { CreateMeetingRoomBodyDto, UpdateMeetingRoomBodyDto } from '../dtos/meeting-room.dto';

@Injectable()
export class AdminMeetingRoomService {
  constructor(private readonly prisma: PrismaService) {}

  async getMeetingRooms(): Promise<MeetingRoom[]> {
    const meetingRooms = await this.prisma.meetingRoom.findMany({
      where: {},
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,

        name: true,
        description: true,
        address: true,
        image: true,
        facilities: true,

        active: true,

        capacity: true,
        credit: true,

        enablePeakTime: true,
        peakTimeCredit: true,
        peakTimeStartAt: true,
        peakTimeEndAt: true,

        reservationInterval: true,
      },
    });

    return meetingRooms.map(meetingRoom =>
      MeetingRoomSchema.parse({
        ...meetingRoom,
        reservations: [],
      })
    );
  }

  async getMeetingRoomReservations(date: Date): Promise<MeetingRoomReservation[]> {
    const targetDate = date;

    const meetingRoomReservations = await this.prisma.meetingRoomReservation.findMany({
      where: {
        startAt: { gte: targetDate },
        endAt: { lte: add(targetDate, { days: 1 }) },
      },
      select: {
        id: true,
        meetingRoomId: true,

        startAt: true,
        endAt: true,

        user: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const res = meetingRoomReservations.map(reservation =>
      MeetingRoomReservationSchema.parse({
        ...reservation,
        user: {
          ...reservation.user,
          companyName: reservation?.user?.company?.name,
        },
      })
    );

    return res;
  }

  async createMeetingRoom(data: CreateMeetingRoomBodyDto): Promise<MeetingRoom> {
    const meetingRoom = await this.prisma.meetingRoom.create({
      data: {
        name: data.name,
        image: data.image,
        facilities: data.facilities.split(','),

        capacity: data.capacity,

        enablePeakTime: true,
        peakTimeStartAt: data.peakTimeStartAt,
        peakTimeEndAt: data.peakTimeEndAt,

        credit: data.credit,
        peakTimeCredit: data.peakTimeCredit,
      },
    });

    return meetingRoom;
  }

  async updateMeetingRoom(id: string, data: UpdateMeetingRoomBodyDto): Promise<MeetingRoom> {
    const meetingRoom = await this.prisma.meetingRoom.update({
      where: { id },
      data: {
        name: data.name,
        image: data.image,
        facilities: data.facilities.split(','),

        capacity: data.capacity,

        enablePeakTime: true,
        peakTimeStartAt: data.peakTimeStartAt,
        peakTimeEndAt: data.peakTimeEndAt,

        credit: data.credit,
        peakTimeCredit: data.peakTimeCredit,
      },
    });

    return meetingRoom;
  }

  async deleteMeetingRoom(id: string): Promise<void> {
    await this.prisma.meetingRoom.delete({
      where: { id },
    });
  }
}
