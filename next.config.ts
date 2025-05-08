import type { NextConfig } from "next";

// Load environment variables to use in the config
const awsBucketName = process.env.AWS_BUCKET_NAME || 'your_bucket_name_here';
const awsRegion = process.env.AWS_REGION || 'us-east-1';

const nextConfig: NextConfig = {
  /* config options here */
  // Increase API body size limit for image uploads
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
    responseLimit: '8mb',
  },
  images: {
    remotePatterns: [
      // OpenAI Domains
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.openai.com',
        pathname: '**',
      },
      // AWS S3 bucket domains - will be dynamically added if configured
      {
        protocol: 'https',
        hostname: `${awsBucketName}.s3.amazonaws.com`,
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: `${awsBucketName}.s3.${awsRegion}.amazonaws.com`,
        pathname: '**',
      },
      // Unsplash images for the logo examples
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      // Pinterest images for the logo examples
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '**',
      },
    ],
    // Allow data URLs for base64 images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Add server environment variables that should be available at build time
  env: {
    AWS_BUCKET_NAME: awsBucketName,
    AWS_REGION: awsRegion,
  },
};

export default nextConfig;
