import { UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

export const decodeJwtForExpire = (token: string) => {
  const decoded = jwt.decode(token) as { exp: number };
  if (!decoded || !decoded.exp) throw new UnauthorizedException('Invalid token');

  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - currentTime;

  return {
    expirationTime: new Date(decoded.exp * 1000),
    timeLeft: timeLeft * 1000,
  };
};
