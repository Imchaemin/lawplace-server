import { BadRequestException, Injectable } from '@nestjs/common';
import { differenceInMinutes, isAfter, isBefore } from 'date-fns';

import { MeetingRoom, MeetingRoomSchema } from '@/entities/meeting-room';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class MeetingRoomService {
  constructor(private readonly prisma: PrismaService) {}

  async getMeetingRooms(): Promise<MeetingRoom[]> {
    const meetingRooms = await this.prisma.meetingRoom.findMany({
      where: {
        active: true,
      },
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
        meetingRoomReservations: {
          select: {
            id: true,

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
        },
      },
    });

    const res = meetingRooms.map(meetingRoom =>
      MeetingRoomSchema.parse({
        ...meetingRoom,

        reservations: meetingRoom?.meetingRoomReservations.map(reservation => ({
          ...reservation,
          user: {
            ...reservation.user,
            companyName: reservation?.user?.company?.name,
          },
        })),
      })
    );

    return res;
  }

  async reserveMeetingRoom(
    userId: string,
    meetingRoomId: string,

    startAt: Date,
    endAt: Date
  ): Promise<void> {
    const invalidDate = isBefore(endAt, new Date()) || isBefore(endAt, startAt);
    const currentReservation = await this.prisma.meetingRoomReservation.findMany({
      where: {
        meetingRoomId,
        startAt: { lte: endAt },
        endAt: { gte: startAt },
      },
    });
    if (currentReservation.length > 0 || invalidDate) {
      throw new BadRequestException('Invalid date');
    }

    const meetingRoom = await this.prisma.meetingRoom.findUnique({
      where: {
        id: meetingRoomId,
      },
      select: {
        credit: true,
        peakTimeCredit: true,

        peakTimeStartAt: true,
        peakTimeEndAt: true,

        reservationInterval: true,
      },
    });
    // Check if meeting room exists
    if (!meetingRoom) {
      throw new BadRequestException('Meeting room not found');
    }

    // Calculate total intervals and peak time intervals
    const totalTimeslots = this.calculateTimeslots(startAt, endAt, meetingRoom.reservationInterval);
    const peakTimeTimeslots = this.calculatePeakTimeslots(
      startAt,
      endAt,
      meetingRoom.peakTimeStartAt,
      meetingRoom.peakTimeEndAt,
      meetingRoom.reservationInterval
    );

    const regularTimeslots = totalTimeslots - peakTimeTimeslots;
    const totalCredit =
      peakTimeTimeslots * Number(meetingRoom?.peakTimeCredit || 0) +
      regularTimeslots * Number(meetingRoom?.credit || 0);

    await this.prisma.meetingRoomReservation.create({
      data: {
        userId,
        meetingRoomId,
        startAt,
        endAt,
        totalCredit,
      },
    });
  }

  calculateTimeslots(startAt: Date, endAt: Date, timeInterval: number): number {
    const diffInMinutes = differenceInMinutes(endAt, startAt);

    if (timeInterval === 0 || diffInMinutes <= 0) return 0;
    return Math.ceil(diffInMinutes / timeInterval);
  }

  /**
   * "HH:mm" 문자열을 기준 날짜의 시간으로 변환
   */
  private toDateWithTime(baseDate: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  calculatePeakTimeslots(
    startAt: Date,
    endAt: Date,
    peakTimeStartAt: string, // hour:minute
    peakTimeEndAt: string, // hour:minute
    reservationInterval: number
  ): number {
    if (!peakTimeStartAt || !peakTimeEndAt) return 0;

    // 기준 날짜의 peaktime 구간을 Date로 변환
    const peakStart = this.toDateWithTime(startAt, peakTimeStartAt);
    const peakEnd = this.toDateWithTime(startAt, peakTimeEndAt);

    // 예약 구간과 피크타임 구간의 겹치는 부분 계산
    const overlapStart = isAfter(startAt, peakStart) ? startAt : peakStart;
    const overlapEnd = isBefore(endAt, peakEnd) ? endAt : peakEnd;

    // 겹치는 구간이 없으면 0
    if (isAfter(overlapStart, overlapEnd)) return 0;

    return this.calculateTimeslots(overlapStart, overlapEnd, reservationInterval);
  }
}
