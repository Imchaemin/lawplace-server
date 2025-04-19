import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

export type RequestWithAuth = Request & {
  auth?: JwtPayload;
};

export interface JwtPayload extends DefaultJwtPayload {
  sub: string;
}
