declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        telegramId: string;
        username: string | null;
        firstName: string;
        lastName: string | null;
        photoUrl: string | null;
        profileType: string | null;
        isAdmin: boolean;
      };
      authTokenHash?: string;
    }
  }
}

export {};
