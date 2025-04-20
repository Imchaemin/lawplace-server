import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

import { JWT_SECRET } from '@/constants';
import { JwtPayload, RequestWithAuth } from '@/dtos/auth.dto';

@Injectable()
export abstract class BaseAuthGuard implements CanActivate {
  protected abstract handleNoToken(request: RequestWithAuth): boolean;
  protected abstract validateDecoded(decoded: JwtPayload): boolean;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      return this.handleNoToken(request);
    }

    const token = this.extractToken(authHeader);
    const decoded = this.validateToken(token);

    if (!this.validateDecoded(decoded)) {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'invalid authentication token, invalid token payload',
      });
    }

    request.auth = decoded;
    return true;
  }

  private extractToken(authHeader: string): string {
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
  }

  private validateToken(token: string): JwtPayload {
    try {
      const payload = verify(token, JWT_SECRET);
      if (typeof payload === 'string') {
        throw new UnauthorizedException({
          type: 'UNAUTHORIZED',
          message: 'invalid authentication token, invalid token type',
        });
      }
      return payload as JwtPayload;
    } catch {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'invalid authentication token',
      });
    }
  }
}

@Injectable()
export class AuthGuard extends BaseAuthGuard {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleNoToken(_request: RequestWithAuth): boolean {
    throw new UnauthorizedException({
      type: 'UNAUTHORIZED',
      message: 'authorization token is missing',
    });
  }

  protected validateDecoded(decoded: JwtPayload): boolean {
    return typeof decoded.sub === 'string' && decoded.sub.length > 0;
  }
}
