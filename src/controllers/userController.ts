import { Request, Response } from 'express';
import prisma from '../config/db';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

// Helper function to convert Buffer to Readable stream
const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable._read = () => {}; // _read is required but not used
  readable.push(buffer);
  readable.push(null); // Indicates end of stream
  return readable;
};

// Helper function to upload image to Cloudinary
const uploadImage = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = bufferToStream(buffer);

    const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result?.secure_url || '');
    });

    stream.pipe(uploadStream);
  });
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const requesterId = req.userId; // Assuming you have userId in req from auth middleware

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.privacy === 'PRIVATE' && userId !== requesterId) {
      return res.status(403).json({ message: 'Access denied: Profile is private' });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { fullName, bio, location, website, privacy } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const profilePictureFile = files?.profilePicture?.[0];
  const coverPhotoFile = files?.coverPhoto?.[0];

  try {
    const existingProfile = await prisma.userProfile.findUnique({ where: { userId } });

    if (!existingProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    let profilePictureUrl = existingProfile.profilePicture;
    let coverPhotoUrl = existingProfile.coverPhoto;

    if (profilePictureFile && profilePictureFile.buffer) {
      profilePictureUrl = await uploadImage(profilePictureFile.buffer);
    }

    if (coverPhotoFile && coverPhotoFile.buffer) {
      coverPhotoUrl = await uploadImage(coverPhotoFile.buffer);
    }

    const updatedProfile = await prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          update: {
            fullName,
            bio,
            profilePicture: profilePictureUrl,
            coverPhoto: coverPhotoUrl,
            location,
            website,
          },
        },
        privacy, // Update the privacy setting
      },
    });

    res.status(200).json({ message: 'User profile updated successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};



// Delete user profile
export const deleteUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;


   // Ensure the requester is deleting their own profile
  if (userId !== req.userId) {
    return res.status(403).json({ message: 'Forbidden: Cannot delete another user\'s profile' });
  }

  try {
    const existingProfile = await prisma.userProfile.findUnique({ where: { userId } });

    if (!existingProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    await prisma.userProfile.delete({ where: { userId } });

    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};
