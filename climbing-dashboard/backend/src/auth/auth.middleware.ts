import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { hashSessionToken, publicUser } from './session.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const match = req.header('authorization')?.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ message: 'Authentication required' });

  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashSessionToken(match[1]) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.authSession.delete({ where: { tokenHash: session.tokenHash } });
    return res.status(401).json({ message: 'Session expired' });
  }

  req.authUser = publicUser(session.user);
  req.authTokenHash = session.tokenHash;
  return next();
}
