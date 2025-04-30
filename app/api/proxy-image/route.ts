import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
      return new NextResponse('URL parameter is required', { status: 400 });
    }

    // Fetch the image from the external URL
    const imageResponse = await fetch(url, {
      cache: 'no-store', // Skip cache for fresh results
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!imageResponse.ok) {
      console.error(`Error fetching image: ${imageResponse.status} ${imageResponse.statusText}`);
      return new NextResponse('Failed to fetch image', { status: imageResponse.status });
    }

    // Get the blob of the response
    const imageBlob = await imageResponse.blob();

    // Create a new response with the image blob
    const response = new NextResponse(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': imageResponse.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

    return response;
  } catch (error) {
    console.error('Error in image proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 