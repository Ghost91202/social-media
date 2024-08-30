import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const SECRET_KEY = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImthcmFuIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.kUDYWGXGSMM2Q2wDrFkgFYZf_DHty-mxzaViig0nzvE';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
req.user = {
      id: decoded.userId,
      username: decoded.username,
    };    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};


export const authorizeProfileAccess = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { privacy: true }
    });

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (profile.privacy === 'PRIVATE' && userId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied: Profile is private' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};
