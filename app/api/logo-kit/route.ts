import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import Sharp from "sharp";
import JSZip from "jszip";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as potrace from "potrace";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  // Create temporary directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logo-kit-'));

  try {
    // Verify authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { imageUrl, prompt } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Create a new zip file
    const zip = new JSZip();
    const logoName = `logo-${Date.now()}`;

    // Add README file
    zip.file("README.txt", `Logo created with LogoGPT
Generated on: ${new Date().toLocaleString()}
Prompt: ${prompt || "Not provided"}

This kit contains the following files:

PNG Files:
- logo.png: High resolution PNG format with transparency
- logo_small.png: Small PNG format for web/mobile
- logo_white.png: White version for dark backgrounds
- logo_black.png: Black version for light backgrounds
- logo_horizontal.png: Horizontal layout version

Vector Files:
- logo.svg: Scalable vector format for print

Web Files:
- logo.webp: Modern web format with small file size
- favicon.png: Browser favicon (16x16)

Need help? Contact support@logogpt.com
`);

    // Extract the key from the S3 URL
    let imageBuffer;

    if (imageUrl.includes('amazonaws.com')) {
      const s3Key = imageUrl.split('.com/')[1];

      // Get the original image from S3
      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: s3Key,
      });

      const s3Response = await s3Client.send(getObjectCommand);
      const chunks: Uint8Array[] = [];

      // @ts-ignore - s3Response.Body is a Readable stream
      for await (const chunk of s3Response.Body) {
        chunks.push(chunk);
      }

      imageBuffer = Buffer.concat(chunks);
    } else {
      // Direct fetch if not from S3 (fallback for testing)
      const response = await fetch(imageUrl);
      imageBuffer = Buffer.from(await response.arrayBuffer());
    }

    // Save original image to disk for better processing
    const pngPath = path.join(tmpDir, `${logoName}.png`);
    fs.writeFileSync(pngPath, imageBuffer);

    // Optimize for high-quality transparency
    const sharpImage = Sharp(imageBuffer);
    const metadata = await sharpImage.metadata();

    // Process image for quality and transparency
    let processedBuffer;
    try {
      // Extract and try to make background transparent
      processedBuffer = await sharpImage
        .toFormat('png')
        .toBuffer();

      // If image is small, resize it to ensure high quality
      if (metadata.width && metadata.height && (metadata.width < 800 || metadata.height < 800)) {
        const maxDimension = Math.max(metadata.width, metadata.height);
        const scaleFactor = 1000 / maxDimension;

        processedBuffer = await Sharp(processedBuffer)
          .resize({
            width: Math.round(metadata.width * scaleFactor),
            height: Math.round(metadata.height * scaleFactor),
            fit: 'fill'
          })
          .png({ quality: 100 })
          .toBuffer();
      }
    } catch (error) {
      console.error("Image optimization failed, using original:", error);
      processedBuffer = imageBuffer;
    }

    // Save and add high-res PNG with transparency
    const optimizedPngPath = path.join(tmpDir, `${logoName}_optimized.png`);
    fs.writeFileSync(optimizedPngPath, processedBuffer);
    zip.file("logo.png", processedBuffer);

    // Create a smaller PNG for web use
    const smallPngBuffer = await Sharp(processedBuffer)
      .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 90 })
      .toBuffer();
    zip.file("logo_small.png", smallPngBuffer);

    // Create WebP version for modern web use
    const webpBuffer = await Sharp(processedBuffer)
      .webp({ quality: 90, lossless: true })
      .toBuffer();
    zip.file("logo.webp", webpBuffer);

    // Generate white version
    const whitePath = path.join(tmpDir, `${logoName}_white.png`);
    try {
      // First create a B&W version
      await Sharp(processedBuffer)
        .toColourspace('b-w')
        .negate() // Make it white
        .png()
        .toFile(whitePath);

      if (fs.existsSync(whitePath)) {
        const whiteBuffer = fs.readFileSync(whitePath);
        zip.file("logo_white.png", whiteBuffer);
      }
    } catch (error) {
      console.error("Failed to create white version with color transform:", error);
      try {
        // Simpler fallback approach
        await Sharp(processedBuffer)
          .threshold(128)
          .negate()
          .png()
          .toFile(whitePath);

        if (fs.existsSync(whitePath)) {
          const whiteBuffer = fs.readFileSync(whitePath);
          zip.file("logo_white.png", whiteBuffer);
        }
      } catch (secondError) {
        console.error("Even simple white version failed:", secondError);
      }
    }

    // Generate black version
    const blackPath = path.join(tmpDir, `${logoName}_black.png`);
    try {
      // Create a B&W version
      await Sharp(processedBuffer)
        .toColourspace('b-w')
        .png()
        .toFile(blackPath);

      if (fs.existsSync(blackPath)) {
        const blackBuffer = fs.readFileSync(blackPath);
        zip.file("logo_black.png", blackBuffer);
      }
    } catch (error) {
      console.error("Failed to create black version with color transform:", error);
      try {
        // Simpler fallback approach
        await Sharp(processedBuffer)
          .threshold(128)
          .png()
          .toFile(blackPath);

        if (fs.existsSync(blackPath)) {
          const blackBuffer = fs.readFileSync(blackPath);
          zip.file("logo_black.png", blackBuffer);
        }
      } catch (secondError) {
        console.error("Even simple black version failed:", secondError);
      }
    }

    // Create horizontal layout version (1.5:1 aspect ratio)
    const horizontalPath = path.join(tmpDir, `${logoName}_horizontal.png`);
    try {
      await Sharp(processedBuffer)
        .resize({
          width: 1200,
          height: 800,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(horizontalPath);

      if (fs.existsSync(horizontalPath)) {
        const horizontalBuffer = fs.readFileSync(horizontalPath);
        zip.file("logo_horizontal.png", horizontalBuffer);
      }
    } catch (error) {
      console.error("Failed to create horizontal version:", error);
    }

    // Generate high-quality SVG using potrace
    const svgPath = path.join(tmpDir, `${logoName}.svg`);
    try {
      // Create a black and white version for potrace
      const bwPath = path.join(tmpDir, `${logoName}_bw.png`);
      await Sharp(processedBuffer)
        .greyscale()
        .normalize()
        .threshold(128)
        .toFile(bwPath);

      // Use potrace for high-quality vector conversion
      const svgOptions = {
        color: '#000000',
        background: 'transparent',
        threshold: 128,
        turdSize: 2,
        optTolerance: 0.2,
        optCurve: true
      };

      // Use potrace directly with a callback
      potrace.trace(bwPath, svgOptions, (err, svg) => {
        if (err) {
          console.error("Potrace error:", err);
          return;
        }

        fs.writeFileSync(svgPath, svg);

        // Only add if file exists
        if (fs.existsSync(svgPath)) {
          const svgContent = fs.readFileSync(svgPath);
          zip.file("logo.svg", svgContent);
        }
      });
    } catch (error) {
      console.error("Failed to generate SVG:", error);
    }

    // Generate favicon
    const faviconPath = path.join(tmpDir, 'favicon.png');
    try {
      await Sharp(processedBuffer)
        .resize(16, 16)
        .png()
        .toFile(faviconPath);

      if (fs.existsSync(faviconPath)) {
        const faviconContent = fs.readFileSync(faviconPath);
        zip.file("favicon.png", faviconContent);
      }
    } catch (error) {
      console.error("Failed to generate favicon:", error);
    }

    // Wait a moment for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate zip file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Return the zip file
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="logo-kit.zip"`,
      },
    });
  } catch (error) {
    console.error("Error generating logo kit:", error);
    return NextResponse.json(
      { error: "Failed to generate logo kit" },
      { status: 500 }
    );
  } finally {
    // Clean up temporary directory
    try {
      if (fs.existsSync(tmpDir)) {
        const files = fs.readdirSync(tmpDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(tmpDir, file));
        });
        fs.rmdirSync(tmpDir);
      }
    } catch (error) {
      console.error("Failed to clean up temp directory:", error);
    }
  }
} 