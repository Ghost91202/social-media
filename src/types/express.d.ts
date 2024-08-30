import { User } from '@prisma/client';

// Extend the Request interface to include userId and user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: User;
      
    }
  }
}
