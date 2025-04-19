import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { APPLE_CLIENT_ID, BE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '@/constants';

interface OAuthTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

@Injectable()
export class AuthOauthService {
  constructor(private readonly httpService: HttpService) {}

  async exchangeGoogleCode(code: string): Promise<OAuthTokenResponse> {
    try {
      const { data } = await this.httpService.axiosRef.post<OAuthTokenResponse>(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${BE_URL}/auth/google/callback`,
          grant_type: 'authorization_code',
        }
      );
      return data;
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Google token exchange failed: ${err.response?.data || err.message}`
      );
    }
  }

  async exchangeAppleCode(code: string): Promise<OAuthTokenResponse> {
    try {
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', APPLE_CLIENT_ID);
      params.append('client_secret', this.generateAppleClientSecret());
      params.append('redirect_uri', `${BE_URL}/auth/apple/callback`);
      params.append('grant_type', 'authorization_code');

      const { data } = await this.httpService.axiosRef.post<OAuthTokenResponse>(
        'https://appleid.apple.com/auth/token',
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return data;
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Apple token exchange failed: ${err.response?.data || err.message}`
      );
    }
  }

  private generateAppleClientSecret(): string {
    const privateKey = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    const clientId = process.env.APPLE_CLIENT_ID;
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: teamId,
      iat: now,
      exp: now + 15777000, // 약 6개월
      aud: 'https://appleid.apple.com',
      sub: clientId,
    };

    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: { alg: 'ES256', kid: keyId },
    });
  }
}
