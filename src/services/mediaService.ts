import cloudinary from '../config/cloudinary';

export const uploadImage = async (filePath: string) => {
  const result = await cloudinary.uploader.upload(filePath, { folder: 'socialmedia/images' });
  return result.secure_url;
};

export const uploadVideo = async (filePath: string) => {
  const result = await cloudinary.uploader.upload(filePath, { resource_type: 'video', folder: 'socialmedia/videos' });
  return result.secure_url;
};
