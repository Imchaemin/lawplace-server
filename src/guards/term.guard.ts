import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class TermsGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const { auth } = req;

    if (!auth?.sub) {
      throw new UnauthorizedException('Need to login');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: auth.sub },
      select: {
        termsAndConditionsAcceptance: {
          select: {
            accepted: true,
            termsAndConditions: {
              select: {
                required: true,
              },
            },
          },
        },
      },
    });
    const accepted = user.termsAndConditionsAcceptance
      .filter(acceptance => acceptance.termsAndConditions.required)
      .every(acceptance => acceptance.accepted);

    if (!accepted) throw new ForbiddenException('Terms and conditions acceptance required');
    return true;
  }
}
