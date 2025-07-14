import { Injectable } from '@nestjs/common';

import { Notice, NoticeSchema, NoticeSimple, NoticeSimpleSchema } from '@/entities/notice';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class AdminNoticeService {
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

  async getNotices(
    skip: number,
    take: number
  ): Promise<{
    data: NoticeSimple[];
    metadata: { paginate: { totalCount: number; totalPage: number } };
  }> {
    const notices = await this.prisma.notice.findMany({
      skip,
      take,
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
    const totalCount = await this.prisma.notice.count();
    const totalPage = take ? Math.ceil(totalCount / take) : 1;

    const res = notices.map(notice => NoticeSimpleSchema.parse(notice));
    return { data: res, metadata: { paginate: { totalCount, totalPage } } };
  }

  private extractTextFromHtml(html: string): string {
    const textWithoutTags = html.replace(/<[^>]*>/g, '');
    const lines = textWithoutTags
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return lines.slice(0, 2).join('\n');
  }

  async createNotice(title: string, image: string, content: string): Promise<void> {
    const textContent = this.extractTextFromHtml(content);

    await this.prisma.notice.create({
      data: {
        title,
        content: textContent,
        html: content,
        image,
      },
    });
  }

  async editNotice(noticeId: string, title: string, image: string, content: string): Promise<void> {
    const textContent = this.extractTextFromHtml(content);

    await this.prisma.notice.update({
      where: { id: noticeId },
      data: {
        title,
        content: textContent,
        html: content,
        image,
      },
    });
  }

  async deleteNotice(noticeId: string): Promise<void> {
    await this.prisma.notice.delete({
      where: { id: noticeId },
    });
  }
}
