import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

export interface OAuthTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple';
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  code?: string;
}

@Injectable()
export class AuthOauthService {
  constructor(private readonly httpService: HttpService) {}

  async getGoogleUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const { data } = await this.httpService.axiosRef.get<UserInfo>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        provider: 'google',
      };
    } catch (error) {
      throw new Error(`Google userinfo API failed: ${error.response?.data || error.message}`);
    }
  }
}
