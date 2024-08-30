import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import prisma from '../config/db';
import { Readable } from 'stream';
import { Buffer } from 'buffer'; // Ensure you import buffer for Node.js


// Convert buffer to a readable stream
const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable._read = () => {}; // _read is required but not used
  readable.push(buffer);
  readable.push(null); // Indicates end of stream
  return readable;
};


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

export const createPost = async (req: Request, res: Response) => {
  const { userId, content, isPublic } = req.body;
  const file = req.file;

  try {
    let imageUrl: string | null = null;

    if (file) {
      imageUrl = await uploadImage(file.buffer);
    }


        const isPublicBoolean = isPublic === 'true';

    const post = await prisma.post.create({
      data: {
        userId,
        content,
        imageUrl,
        isPublic:isPublicBoolean,
      },
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};


export const likePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId } = req.body; // In real apps, extract this from auth middleware.

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the user already liked the post
    const existingLike = await prisma.like.findFirst({
      where: { postId, userId },
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Post already liked by this user' });
    }

    // Create the like
    const like = await prisma.like.create({
      data: { postId, userId },
    });

    res.status(201).json({ message: 'Post liked successfully', like });
  } catch (error) {
   res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};

// Comment on a post
export const commentOnPost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId, content } = req.body;
  console.log("comment testing ");

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
      },
    });

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};

// Reply to a comment
export const replyToComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { userId, content } = req.body;

  try {
    // Check if the parent comment exists
    const parentComment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!parentComment) return res.status(404).json({ message: 'Comment not found' });

    // Create the reply
    const reply = await prisma.comment.create({
      data: {
        userId,
        content,
        parentId: commentId,
        postId: parentComment.postId, // inherit the postId from the parent comment
      },
    });

    res.status(201).json({ message: 'Reply added successfully', reply });
  } catch (error) {
   res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};


// Like a comment
export const likeComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    // Check if the comment exists
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if the user already liked the comment
    const existingLike = await prisma.like.findFirst({
      where: { commentId, userId },
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Comment already liked by this user' });
    }

    // Create the like
    const like = await prisma.like.create({
      data: { commentId, userId },
    });

    res.status(201).json({ message: 'Comment liked successfully', like });
  } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
};
