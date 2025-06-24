export const ENV = process.env.ENV;

export const IS_LOCAL = ENV === 'local';
export const IS_DEV = ENV === 'dev';
export const IS_PROD = ENV === 'prod';

export const DISABLE_CRON = process.env.DISABLE_CRON === 'true';

export const FE_URL = IS_LOCAL
  ? 'http://localhost:3000'
  : IS_DEV
  ? 'https://law-place.kr'
  : 'https://law-place.kr';

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_DOMAIN = IS_LOCAL ? 'localhost' : IS_DEV ? 'lawplace' : 'lawplace';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
export const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
export const APPLE_KEY_ID = process.env.APPLE_KEY_ID;

export const IS_AUDIT = process.env.IS_AUDIT === 'true';
