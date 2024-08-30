import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPostById = async (id: string) => {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      comments: true,
      likes: true,
    },
  });
};

export const createPost = async (data: {
  userId: string;
  content: string;
  mediaUrl?: string;
}) => {
  return await prisma.post.create({
    data,
  });
};

export const updatePost = async (id: string, data: {
  content?: string;
  mediaUrl?: string;
  isPublic?: boolean;
}) => {
  return await prisma.post.update({
    where: { id },
    data,
  });
};

export const deletePost = async (id: string) => {
  return await prisma.post.delete({
    where: { id },
  });
};
