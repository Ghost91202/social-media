// src/types.d.ts
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        username: string;
        // Add other user properties if necessary
      };
    }
  }
}
