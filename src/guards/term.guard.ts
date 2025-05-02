import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { PrismaService } from '@/prisma/services/prisma.service';
@Injectable()
export class TermsGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const { auth } = req;

    const user = await this.prisma.user.findUnique({
      where: { id: auth.sub },
      select: {
        termsAndConditionsAccepted: true,
      },
    });

    if (!user.termsAndConditionsAccepted) {
      throw new ForbiddenException({
        type: 'TERMS_AND_CONDITIONS',
        message: 'terms and conditions acceptance required',
      });
    }
    return true;
  }
}
