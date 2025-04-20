import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/clients/client';

import { RequestWithAuth } from '@/dtos/auth.dto';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const { auth } = req;

    if (!auth.role || auth.role !== UserRole.ADMIN) {
      throw new ForbiddenException({
        type: 'ADMIN',
        message: 'admin role required',
      });
    }
    return true;
  }
}
