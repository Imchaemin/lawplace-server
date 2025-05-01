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

  calculatePeakTimeslots(
    startAt: Date,
    endAt: Date,
    peakTimeStartAt: Date,
    peakTimeEndAt: Date,

    reservationInterval: number
  ): number {
    if (
      !peakTimeStartAt ||
      !peakTimeEndAt ||
      isAfter(startAt, peakTimeEndAt) ||
      isBefore(endAt, peakTimeStartAt)
    )
      return 0;

    const overlapStart = isAfter(startAt, peakTimeStartAt) ? startAt : peakTimeStartAt;
    const overlapEnd = isBefore(endAt, peakTimeEndAt) ? endAt : peakTimeEndAt;

    return this.calculateTimeslots(overlapStart, overlapEnd, reservationInterval);
  }
}
