import { Injectable } from '@nestjs/common';
import { sub } from 'date-fns';

import { BaseReqQueryDto, PaginateMetadataSchema } from '@/dtos/base.dto';
import { UserNotificationSchema } from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

import { GetUserNotificationsResDto } from '../dtos/user-notification.dto';

@Injectable()
export class UserNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(
    userId: string,
    query: BaseReqQueryDto
  ): Promise<GetUserNotificationsResDto> {
    const { paginate, sort, filters: filtersRaw } = query;
    const { cursor, take, skip } = paginate || {};
    const { orderBy, order } = sort || {};
    const filters =
      filtersRaw?.map(({ property, rule, value }) => ({
        [property]: { [rule]: value },
      })) || [];

    const sevenDaysAgo = sub(new Date(), { days: 7 });
    const where = {
      AND: [
        ...filters,
        {
          createdAt: { gte: sevenDaysAgo },
        },
        {
          OR: [
            { target: null }, // target이 null인 경우 (모든 사용자용)
            { target: userId }, // target이 특정 userId와 일치하는 경우
          ],
        },
      ],
    };
    const notifications = await this.prisma.notification.findMany({
      cursor: cursor ? { id: cursor } : undefined,
      where,
      orderBy: {
        createdAt: 'desc',
        ...(orderBy ? { [orderBy]: order || 'asc' } : {}),
      },
      take,
      skip,
      select: {
        id: true,
        title: true,
        content: true,
        link: true,
        metadata: true,
        target: true,

        createdAt: true,

        notificationCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        notificationReads: {
          where: { userId },
          select: {
            id: true,
            read: true,
          },
        },
      },
    });

    const totalCount = await this.prisma.notification.count({ where });
    const totalPage = take ? Math.ceil(totalCount / take) : 1;
    const nextCursor =
      !take || notifications.length < take
        ? undefined
        : notifications?.[notifications.length - 1]?.id;

    const res = notifications.map(notification =>
      UserNotificationSchema.parse({
        ...notification,
        read: notification.notificationReads?.[0]?.read || false,
      })
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

  async getUserNewNotifications(userId: string): Promise<boolean> {
    const sevenDaysAgo = sub(new Date(), { days: 7 });
    const where = {
      AND: [
        {
          createdAt: { gte: sevenDaysAgo },
        },
        {
          OR: [
            { target: null }, // target이 null인 경우 (모든 사용자용)
            { target: userId }, // target이 특정 userId와 일치하는 경우
          ],
        },
      ],
    };
    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        notificationReads: {
          where: { userId },
          select: {
            read: true,
          },
        },
      },
    });
    const unReadNotifications = notifications.filter(
      notification => !notification.notificationReads?.[0]?.read
    );

    return unReadNotifications.length > 0;
  }

  async readNotification(id: string, userId: string): Promise<void> {
    await this.prisma.notificationRead.upsert({
      where: {
        userId_notificationId: {
          userId,
          notificationId: id,
        },
      },
      update: {
        read: true,
      },
      create: {
        notificationId: id,
        userId,
        read: true,
      },
    });
  }
}
