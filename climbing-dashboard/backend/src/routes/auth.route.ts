import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { validateTelegramInitData } from '../auth/telegram.js';
import { createSession, publicUser } from '../auth/session.js';
import { timersService } from '../services/timers.service.js';

export const authRouter = Router();

authRouter.post('/telegram', async (req, res) => {
  const initData = req.body?.initData;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (typeof initData !== 'string' || !initData || initData.length > 16_384) {
    return res.status(400).json({ message: 'Telegram initData is required' });
  }
  if (!botToken) {
    return res.status(503).json({ message: 'Telegram authentication is not configured' });
  }

  let telegramUser;
  try {
    telegramUser = validateTelegramInitData(initData, botToken);
  } catch {
    return res.status(401).json({ message: 'Telegram authorization could not be verified' });
  }

  const adminIds = new Set(
    (process.env.TELEGRAM_ADMIN_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean),
  );
  const user = await prisma.user.upsert({
    where: { telegramId: String(telegramUser.id) },
    create: {
      telegramId: String(telegramUser.id),
      username: telegramUser.username ?? null,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name ?? null,
      photoUrl: telegramUser.photo_url ?? null,
      isAdmin: adminIds.has(String(telegramUser.id)),
    },
    update: {
      username: telegramUser.username ?? null,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name ?? null,
      photoUrl: telegramUser.photo_url ?? null,
      isAdmin: adminIds.has(String(telegramUser.id)),
    },
  });
  const session = await createSession(user.id);
  await timersService.ensureDefaults(user.id);

  return res.status(200).json({
    token: session.token,
    expiresAt: session.expiresAt,
    user: publicUser(user),
  });
});

authRouter.post('/dev', async (req, res) => {
  const origin = req.get('origin') ?? '';
  const isLocalOrigin = /^http:\/\/(localhost|127\.0\.0\.1):5173$/.test(origin);
  if (process.env.NODE_ENV === 'production' || process.env.DEV_AUTH_ENABLED !== 'true' || !isLocalOrigin) {
    return res.status(404).json({ message: 'Not found' });
  }

  const user = await prisma.user.upsert({
    where: { telegramId: 'local-dev-user' },
    create: {
      telegramId: 'local-dev-user',
      username: 'local_dev',
      firstName: 'Локальный тестовый аккаунт',
      profileType: 'CLIMBER',
      isAdmin: true,
    },
    update: {},
  });
  const session = await createSession(user.id);
  await timersService.ensureDefaults(user.id);

  return res.status(200).json({
    token: session.token,
    expiresAt: session.expiresAt,
    user: publicUser(user),
  });
});

authRouter.get('/me', requireAuth, (req, res) => res.json({ user: req.authUser }));

authRouter.put('/profile-type', requireAuth, async (req, res) => {
  const profileType = req.body?.profileType;
  if (profileType !== 'CLIMBER' && profileType !== 'TRAINER') {
    return res.status(400).json({ message: 'profileType must be CLIMBER or TRAINER' });
  }

  const currentUser = await prisma.user.findUnique({ where: { id: req.authUser!.id } });
  if (!currentUser) return res.status(401).json({ message: 'User not found' });
  if (currentUser.profileType) {
    return res.status(409).json({ message: 'Profile type has already been selected' });
  }

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: { profileType },
  });
  return res.json({ user: publicUser(user) });
});

authRouter.post('/logout', requireAuth, async (req, res) => {
  await prisma.authSession.deleteMany({ where: { tokenHash: req.authTokenHash! } });
  return res.status(204).send();
});
