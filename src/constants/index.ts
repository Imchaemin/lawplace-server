export const ENV = process.env.ENV;

export const IS_LOCAL = ENV === 'local';
export const IS_DEV = ENV === 'dev';
export const IS_PROD = ENV === 'prod';

export const DISABLE_CRON = process.env.DISABLE_CRON === 'true';
