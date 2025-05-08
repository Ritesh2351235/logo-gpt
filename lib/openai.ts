import OpenAI, { toFile } from 'openai';

// Check for API key more gracefully
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
  timeout: 60000, // 60 seconds timeout
  maxRetries: 3, // Allow 3 retries
});

// Helper function to add delay between retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateLogo(prompt: string): Promise<string> {
  try {
    // Verify API key at runtime
    if (!apiKey) {
      throw new Error("OpenAI API key is missing");
    }

    console.log('Generating logo with GPT-Image-1 model:', prompt);

    // Implement our own retry logic for network errors
    let retries = 0;
    const maxRetries = 3;
    let lastError;

    while (retries < maxRetries) {
      try {
        // Using the GPT-Image-1 model
        const response = await openai.images.generate({
          model: "gpt-image-1",
          prompt: `Create a professional, minimalist logo for: ${prompt}. The logo should be clean, modern, and suitable for business use.`,
          n: 1,
          quality: "medium",
          // Note: GPT-Image-1 might have different parameters than DALL-E 3
          // Size and quality might be handled differently
        });

        console.log('OpenAI API Response received');

        if (!response.data || response.data.length === 0) {
          throw new Error("No image generated");
        }

        // Extract the base64 data
        const base64Data = response.data[0].b64_json;
        if (!base64Data) {
          throw new Error("No base64 image data received from OpenAI");
        }

        // Convert the base64 data to a data URL
        const imageUrl = `data:image/png;base64,${base64Data}`;
        return imageUrl;
      } catch (error: any) {
        lastError = error;

        // Only retry on network-related errors
        if (error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('fetch') ||
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT') {
          retries++;
          console.log(`Network error occurred. Retry attempt ${retries}/${maxRetries}`);

          // Exponential backoff: 1s, 2s, 4s
          const backoffTime = Math.pow(2, retries - 1) * 1000;
          await delay(backoffTime);
          continue;
        }

        // For non-network errors, throw immediately
        throw error;
      }
    }

    // If we've exhausted retries, throw the last error
    throw lastError;
  } catch (error: any) {
    // Log the full error object
    console.error('OpenAI API Error Details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });

    // Throw a more specific error message
    if (error.status === 401) {
      throw new Error("Invalid API key or authentication error");
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded or quota reached");
    } else if (error.response?.data?.error?.message) {
      throw new Error(`OpenAI Error: ${error.response.data.error.message}`);
    } else {
      throw new Error(`Failed to generate logo: ${error.message}`);
    }
  }
}

export async function editImage(imageBase64: string, prompt: string): Promise<string> {
  try {
    // Verify API key at runtime
    if (!apiKey) {
      throw new Error("OpenAI API key is missing");
    }

    console.log('Editing image with GPT-Image-1 model:', prompt);

    // Implement our own retry logic for network errors
    let retries = 0;
    const maxRetries = 3;
    let lastError;

    while (retries < maxRetries) {
      try {
        // Convert base64 to File object using OpenAI's toFile helper
        // First, strip the data:image prefix if present
        const strippedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(strippedBase64, 'base64');
        const imageFile = await toFile(buffer, 'image.png', { type: 'image/png' });

        // Using the GPT-Image-1 model for editing
        try {
          const response = await openai.images.edit({
            model: "gpt-image-1",
            image: imageFile,
            prompt: `${prompt}. Maintain a professional, clean and modern style suitable for business use.`,
            n: 1,
            quality: "medium",
          });

          console.log('OpenAI API Edit Response received');
          console.log('Response data:', JSON.stringify(response));

          if (!response.data || response.data.length === 0) {
            throw new Error("No image generated from edit");
          }

          // Check for b64_json first, then revised_prompt, and finally url if neither is available
          let imageUrl: string;
          const imageData = response.data[0];

          if (imageData.b64_json) {
            console.log('Using base64 image data');
            imageUrl = `data:image/png;base64,${imageData.b64_json}`;
          } else if (imageData.url) {
            console.log('Using image URL data');
            imageUrl = imageData.url;
          } else {
            throw new Error("No image data received from OpenAI");
          }

          console.log('Returning image URL with length:', imageUrl.length);
          return imageUrl;
        } catch (apiError: any) {
          console.error('Error during OpenAI API call:', apiError);
          if (apiError.response) {
            console.error('API response error:', apiError.response.data);
          }
          throw apiError;
        }
      } catch (error: any) {
        lastError = error;

        // Only retry on network-related errors
        if (error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('fetch') ||
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT') {
          retries++;
          console.log(`Network error occurred. Retry attempt ${retries}/${maxRetries}`);

          // Exponential backoff: 1s, 2s, 4s
          const backoffTime = Math.pow(2, retries - 1) * 1000;
          await delay(backoffTime);
          continue;
        }

        // For non-network errors, throw immediately
        throw error;
      }
    }

    // If we've exhausted retries, throw the last error
    throw lastError;
  } catch (error: any) {
    // Log the full error object
    console.error('OpenAI API Edit Error Details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });

    // Throw a more specific error message
    if (error.status === 401) {
      throw new Error("Invalid API key or authentication error");
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded or quota reached");
    } else if (error.response?.data?.error?.message) {
      throw new Error(`OpenAI Error: ${error.response.data.error.message}`);
    } else {
      throw new Error(`Failed to edit image: ${error.message}`);
    }
  }
} 