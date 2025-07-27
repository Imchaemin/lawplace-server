import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple' | 'kakao' | 'naver';
}
@Injectable()
export class AuthOauthService {
  constructor(private readonly httpService: HttpService) {}

  async getGoogleUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const { data } = await this.httpService.axiosRef.get<any>(
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

  async getKakaoUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const { data } = await this.httpService.axiosRef.get<any>(
        'https://kapi.kakao.com/v2/user/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }
      );

      return {
        id: data.id,
        email: data?.kakao_account?.email,
        name: data?.kakao_account?.profile?.nickname,
        provider: 'kakao',
      };
    } catch (error) {
      throw new Error(`Kakao userinfo API failed: ${error.response?.data || error.message}`);
    }
  }

  async getNaverUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const { data } = await this.httpService.axiosRef.get<any>(
        'https://openapi.naver.com/v1/nid/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return {
        id: data?.response?.id,
        email: data?.response?.email,
        name: data?.response?.name,
        provider: 'naver',
      };
    } catch (error) {
      throw new Error(`Naver userinfo API failed: ${error.response?.data || error.message}`);
    }
  }
}
