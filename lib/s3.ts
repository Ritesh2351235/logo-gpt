import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// S3 client configuration 
const s3Configured =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION &&
  process.env.AWS_BUCKET_NAME;

// Initialize S3 client only if credentials are available
const s3Client = s3Configured ? new S3Client({
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
}) : null;

// Bucket name
const bucketName = process.env.AWS_BUCKET_NAME || '';

// Ensure local uploads directory exists
const createLocalUploadDirs = () => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

/**
 * Upload an image to S3 from a URL or base64 data URL
 * @param imageData URL or base64 data URL of the image
 * @param folder Optional folder path inside the bucket
 * @returns Promise with the S3 URL or local URL
 */
export async function uploadImageToS3FromUrl(imageData: string, folder: string = 'logos'): Promise<string> {
  try {
    let imageBuffer: Buffer;
    let contentType: string;

    // Check if the imageData is a base64 data URL
    if (imageData.startsWith('data:')) {
      console.log('Processing base64 data URL');
      // Extract the MIME type and base64 data
      const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 data URL format');
      }

      contentType = matches[1];
      const base64Data = matches[2];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      console.log('Processing remote URL');
      // Fetch image data from URL
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      contentType = response.headers.get('content-type') || 'image/png';
    }

    // Get file extension based on content type
    const fileExtension = contentType.split('/')[1] || 'png';

    // Generate a unique file name
    const fileName = `${uuidv4()}.${fileExtension}`;

    // If S3 is configured, try S3 upload
    if (s3Client && bucketName) {
      try {
        console.log('Attempting to upload to S3...');
        const s3Key = `${folder}/${fileName}`;
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: imageBuffer,
          ContentType: contentType,
          // Remove ACL setting as it's not supported in buckets with Object Ownership enabled
        });

        await s3Client.send(command);
        console.log('Successfully uploaded to S3');

        // Return the public URL
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      } catch (s3Error) {
        console.error('Error uploading to S3, falling back to local storage:', s3Error);
        // Fall back to local storage
      }
    } else {
      console.log('S3 not configured, using local storage');
    }

    // Local file storage fallback
    console.log('Using local file storage fallback for image');
    const uploadDir = createLocalUploadDirs();
    const localFilePath = path.join(uploadDir, fileName);

    fs.writeFileSync(localFilePath, imageBuffer);

    // Return local URL path
    return `/uploads/logos/${fileName}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image (from S3 or local filesystem)
 * @param imageUrl The URL of the image to delete
 */
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Check if it's an S3 URL
    if (imageUrl.includes('amazonaws.com') && s3Client) {
      // Extract the file key from the URL
      const urlObj = new URL(imageUrl);
      const key = urlObj.pathname.substring(1); // Remove leading '/'

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await s3Client.send(command);
    }
    // Check if it's a local file
    else if (imageUrl.startsWith('/uploads/')) {
      const localFilePath = path.join(process.cwd(), 'public', imageUrl);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
} 