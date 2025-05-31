import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreditTransactionType } from '@prisma/client';
import { subMinutes } from 'date-fns';
import { isAfter } from 'date-fns';

import { BaseReqQueryDto, PaginateMetadataSchema } from '@/dtos/base.dto';
import { UserMeetingRoomReservationSchema } from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

import { GetUserMeetingRoomReservationsResDto } from '../dtos/user-meeting-room.dto';

@Injectable()
export class UserMeetingRoomService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserMeetingRoomReservations(
    userId: string,
    query: BaseReqQueryDto
  ): Promise<GetUserMeetingRoomReservationsResDto> {
    const { paginate, sort, filters: filtersRaw } = query;

    const { cursor, take, skip } = paginate || {};
    const { orderBy, order } = sort || {};
    const filters =
      filtersRaw?.map(({ property, rule, value }) => ({
        [property]: { [rule]: value },
      })) || [];

    const where = {
      AND: [
        ...filters,
        {
          userId,
          endAt: {
            gte: new Date(),
          },
        },
      ],
    };

    const reservations = await this.prisma.meetingRoomReservation.findMany({
      cursor: cursor ? { id: cursor } : undefined,
      where,
      orderBy: {
        startAt: 'asc',
        ...(orderBy ? { [orderBy]: order || 'asc' } : {}),
      },
      take,
      skip,
      select: {
        id: true,

        startAt: true,
        endAt: true,

        totalCredit: true,

        meetingRoom: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
            image: true,
          },
        },
      },
    });

    const totalCount = await this.prisma.meetingRoomReservation.count({ where });
    const totalPage = take ? Math.ceil(totalCount / take) : 1;
    const nextCursor =
      !take || reservations.length < take ? undefined : reservations?.[reservations.length - 1]?.id;

    const res = reservations.map(reservation =>
      UserMeetingRoomReservationSchema.parse(reservation)
    );

    const paginateMetadata = PaginateMetadataSchema.parse({
      totalCount,
      totalPage,
      cursor: nextCursor,
    });

    return {
      data: res,
      metadata: paginateMetadata,
    };
  }

  async cancel(userId: string, reservationId: string) {
    const reservation = await this.prisma.meetingRoomReservation.findUnique({
      where: { id: reservationId, userId },
    });
    if (!reservation) throw new NotFoundException('Not found reservation');

    const now = new Date();
    const before10Minutes = isAfter(now, subMinutes(reservation.startAt, 10));
    if (before10Minutes) throw new BadRequestException('Reservation is before now');

    await this.prisma.meetingRoomReservation.delete({
      where: { id: reservationId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        credit: true,
      },
    });

    await this.prisma.credit.update({
      where: { id: user.credit.id },
      data: { currentCredit: { increment: reservation.totalCredit } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        creditId: user.credit.id,
        name: '회의실 예약 취소',
        userId,
        type: CreditTransactionType.REFUND_MEETING_ROOM,
        amount: reservation.totalCredit,
      },
    });
  }
}
