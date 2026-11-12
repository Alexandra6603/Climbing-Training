import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../db/prisma.js';

const SESSION_LIFETIME_DAYS = 30;

export const hashSessionToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_DAYS * 24 * 60 * 60 * 1000);

  await prisma.authSession.create({
    data: { tokenHash: hashSessionToken(token), userId, expiresAt },
  });

  return { token, expiresAt };
}

export function publicUser(user: {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  profileType: string | null;
  isAdmin: boolean;
}) {
  return {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    profileType: user.profileType,
    isAdmin: user.isAdmin,
  };
}
