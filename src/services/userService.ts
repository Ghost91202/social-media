import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { Request, Response } from 'express';

const saltRounds = 10;

export const registerUser = async (username: string, email: string, password: string) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    });

    // Create corresponding user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id, // Use the ID from the newly created user
        fullName: '', // Default values for profile fields
        bio: '',
        profilePicture: '',
        coverPhoto: '',
        location: '',
        website: '',
      },
    });

    return user; // Return the created user object
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

// Find user by email
export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};
