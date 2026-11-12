import { createHmac, timingSafeEqual } from 'node:crypto';

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export function validateTelegramInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const keys = [...params.keys()];
  if (new Set(keys).size !== keys.length) {
    throw new Error('Duplicate Telegram initData fields');
  }
  const receivedHash = params.get('hash');
  const authDate = Number(params.get('auth_date'));
  const userValue = params.get('user');

  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash) || !userValue) {
    throw new Error('Invalid Telegram initData');
  }

  const fields = [...params.entries()]
    .filter(([key]) => key !== 'hash')
    .map(([key, value]) => `${key}=${value}`)
    .sort();
  const dataCheckString = fields.join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest();
  const hashBuffer = Buffer.from(receivedHash, 'hex');

  if (hashBuffer.length !== expectedHash.length || !timingSafeEqual(hashBuffer, expectedHash)) {
    throw new Error('Invalid Telegram signature');
  }

  const now = Math.floor(Date.now() / 1000);
  const configuredMaxAge = Number(process.env.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS ?? 86400);
  const maxAgeSeconds = Number.isFinite(configuredMaxAge) && configuredMaxAge > 0
    ? configuredMaxAge
    : 86400;
  if (!Number.isFinite(authDate) || authDate > now + 30 || now - authDate > maxAgeSeconds) {
    throw new Error('Telegram authorization data has expired');
  }

  let user: TelegramUser;
  try {
    user = JSON.parse(userValue) as TelegramUser;
  } catch {
    throw new Error('Invalid Telegram user data');
  }

  if (!Number.isSafeInteger(user.id) || user.id <= 0 || typeof user.first_name !== 'string') {
    throw new Error('Invalid Telegram user data');
  }

  return user;
}
