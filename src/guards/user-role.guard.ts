import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const { auth } = req;

    const user = await this.prisma.user.findUnique({
      where: { id: auth.sub },
      select: {
        role: true,
      },
    });

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException({
        type: 'ADMIN',
        message: 'admin role required',
      });
    }
    return true;
  }
}
