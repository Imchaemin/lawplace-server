import { Injectable } from '@nestjs/common';

import { Notice, NoticeSchema, NoticeSimple } from '@/entities/notice';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotice(noticeId: string): Promise<Notice> {
    const notice = await this.prisma.notice.findUnique({
      where: { id: noticeId },
      select: {
        id: true,

        title: true,

        url: true,
        content: true,
        html: true,
        image: true,

        metadata: true,

        noticeCategory: {
          select: {
            id: true,
            name: true,
          },
        },

        createdAt: true,
        updatedAt: true,
      },
    });

    return NoticeSchema.parse(notice);
  }

  async getNotices(max: number): Promise<NoticeSimple[]> {
    const notices = await this.prisma.notice.findMany({
      take: max,
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,

        title: true,

        url: true,
        content: true,
        image: true,

        noticeCategory: {
          select: {
            id: true,
            name: true,
          },
        },

        createdAt: true,
        updatedAt: true,
      },
    });

    const res = notices.map(notice => NoticeSchema.parse(notice));
    return res;
  }
}
