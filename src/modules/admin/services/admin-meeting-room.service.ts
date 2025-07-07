import { Injectable } from '@nestjs/common';

import { MeetingRoom, MeetingRoomSchema } from '@/entities/meeting-room';
import { PrismaService } from '@/prisma/services/prisma.service';

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
}
