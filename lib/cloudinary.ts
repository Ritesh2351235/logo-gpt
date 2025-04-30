import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageFromUrl(imageUrl: string, prompt: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'logo-master',
      public_id: `logo-${Date.now()}`,
      tags: ['logo', 'ai-generated'],
      context: `prompt=${prompt}`,
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image. Please try again later.');
  }
} 