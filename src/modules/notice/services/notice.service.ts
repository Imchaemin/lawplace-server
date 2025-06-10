import { Injectable } from '@nestjs/common';

import { Notice, NoticeSchema, NoticeSimple, NoticeSimpleSchema } from '@/entities/notice';
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

    const res = notices.map(notice => NoticeSimpleSchema.parse(notice));
    return res;
  }

  async propagateNotice(noticeId: string): Promise<void> {
    const notice = await this.prisma.notice.findUnique({
      where: { id: noticeId },
    });

    const notificationCategory = await this.prisma.notificationCategory.findUnique({
      where: { name: 'COMMUNITY' },
    });

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
      },
    });

    await Promise.all(
      users.map(user =>
        this.prisma.notification.create({
          data: {
            title: notice.title,
            content: notice.content,
            link: '',
            notificationCategoryId: notificationCategory.id,
            metadata: {
              noticeId: notice.id,
            },
            target: user.id,
          },
        })
      )
    );
  }
}
